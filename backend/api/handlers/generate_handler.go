package handlers

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/zsy619/cese-qoder/backend/models"
	"github.com/zsy619/cese-qoder/backend/services"
	"github.com/zsy619/cese-qoder/backend/utils"
	"go.uber.org/zap"
)

// truncateString 截断字符串，用于日志输出
func truncateString(s string, maxLen int) string {
	if utf8.RuneCountInString(s) <= maxLen {
		return s
	}

	// 转换为rune切片以正确处理中文字符
	runes := []rune(s)
	if len(runes) > maxLen {
		return string(runes[:maxLen]) + "..."
	}
	return s
}

// GenerateRequest AI生成请求
type GenerateRequest struct {
	ProviderID  uint    `json:"provider_id" binding:"required"` // API Provider ID
	Prompt      string  `json:"prompt" binding:"required"`      // 提示词
	Temperature float32 `json:"temperature,omitempty"`          // 温度参数，默认0.7
	MaxTokens   int     `json:"max_tokens,omitempty"`           // 最大token数，默认2000
	Stream      bool    `json:"stream,omitempty"`               // 是否流式响应，默认true
	Model       string  `json:"model,omitempty"`                // 可选：覆盖Provider配置的模型
}

// OpenAIMessage OpenAI格式的消息
type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// OpenAIRequest OpenAI API请求格式
type OpenAIRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAIMessage `json:"messages"`
	Temperature float32         `json:"temperature,omitempty"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
	Stream      bool            `json:"stream"`
}

// OpenAIStreamResponse OpenAI流式响应格式
type OpenAIStreamResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Content string `json:"content"`
			Role    string `json:"role,omitempty"`
		} `json:"delta"`
		FinishReason string `json:"finish_reason,omitempty"`
	} `json:"choices"`
}

// OpenAIResponse OpenAI非流式响应格式
type OpenAIResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// GenerateContentHandler 生成内容处理器（支持所有API Provider类型）
func GenerateContentHandler(ctx context.Context, c *app.RequestContext) {
	utils.Info("开始处理AI内容生成请求")

	var req GenerateRequest
	if err := c.BindJSON(&req); err != nil {
		utils.Error("请求参数绑定失败", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "参数错误")
		return
	}

	utils.Info("请求参数解析成功",
		zap.Uint("provider_id", req.ProviderID),
		zap.String("prompt_preview", truncateString(req.Prompt, 50)),
		zap.Float32("temperature", req.Temperature),
		zap.Int("max_tokens", req.MaxTokens),
		zap.Bool("stream", req.Stream))

	// 获取用户信息
	userMobile, exists := c.Get("userMobile")
	if !exists {
		utils.Error("用户未认证，缺少userMobile信息")
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未授权")
		return
	}

	utils.Info("用户认证成功", zap.String("user_mobile", userMobile.(string)))

	// 获取API Provider配置
	provider, err := services.GetAPIProvider(userMobile.(string), req.ProviderID)
	if err != nil {
		utils.Error("获取API Provider配置失败", zap.Error(err), zap.Uint("provider_id", req.ProviderID))
		utils.ResponseError(&ctx, c, utils.CodeNotFound, "API Provider不存在")
		return
	}

	utils.Info("获取API Provider配置成功",
		zap.Uint("provider_id", provider.ID),
		zap.String("provider_name", provider.Name),
		zap.String("provider_kind", provider.APIKind),
		zap.String("provider_model", provider.APIModel))

	// 检查Provider是否启用
	if provider.APIStatus != 1 {
		utils.Warn("API Provider未启用", zap.Uint("provider_id", provider.ID), zap.Int8("status", provider.APIStatus))
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "该API Provider未启用")
		return
	}

	// // 获取解密后的API Key
	// utils.Info("开始解密API Key", zap.Uint("provider_id", provider.ID))
	// apiKey, err := services.GetDecryptedAPIKey(provider)
	// if err != nil {
	// 	utils.Error("解密API Key失败", zap.Error(err), zap.Uint("provider_id", provider.ID), zap.String("encrypted_key", provider.APIKey))
	// 	utils.ResponseError(&ctx, c, utils.CodeServerError, "配置错误: "+err.Error())
	// 	return
	// }
	// utils.Info("API Key解密成功", zap.Uint("provider_id", provider.ID), zap.Bool("key_empty", apiKey == ""))

	apiKey := strings.TrimSpace(provider.APIKey)

	// 设置默认参数
	if req.Temperature == 0 {
		req.Temperature = 0.7
		utils.Info("设置默认温度参数", zap.Float32("temperature", req.Temperature))
	}
	if req.MaxTokens == 0 {
		req.MaxTokens = 2000
		utils.Info("设置默认最大token数", zap.Int("max_tokens", req.MaxTokens))
	}
	// 默认使用流式响应
	if !req.Stream {
		req.Stream = true
		utils.Info("设置默认流式响应模式", zap.Bool("stream", req.Stream))
	}

	// 使用请求中的模型或Provider配置的模型
	model := req.Model
	if model == "" {
		model = provider.APIModel
		utils.Info("使用Provider配置的模型", zap.String("model", model), zap.String("provider_kind", provider.APIKind))
	} else {
		utils.Info("使用请求中指定的模型", zap.String("model", model), zap.String("provider_kind", provider.APIKind))
	}

	// 根据Provider类型调用相应的API
	utils.Info("开始调用AI生成API",
		zap.String("provider_kind", provider.APIKind),
		zap.Bool("stream", req.Stream))

	if req.Stream {
		handleStreamGeneration(ctx, c, provider, apiKey, model, req)
	} else {
		handleNonStreamGeneration(ctx, c, provider, apiKey, model, req)
	}

	utils.Info("AI内容生成请求处理完成")
}

// handleStreamGeneration 处理流式生成
func handleStreamGeneration(ctx context.Context, c *app.RequestContext, provider *models.APIProvider, apiKey, model string, req GenerateRequest) {
	utils.Info("开始处理流式生成请求",
		zap.Uint("provider_id", provider.ID),
		zap.String("provider_name", provider.Name),
		zap.String("model", model),
		zap.String("provider_kind", provider.APIKind))

	// 构建请求体
	reqBody, err := buildRequestBody(provider, model, req.Prompt, req.Temperature, req.MaxTokens, true)
	if err != nil {
		utils.Error("请求体构建失败", zap.Error(err))
		sendSSEError(c, "请求体构建失败")
		return
	}

	utils.Debug("构建请求体成功", zap.String("request_body", string(reqBody)))

	// 构建API URL
	apiURL := buildAPIURL(provider)
	utils.Info("构建API URL", zap.String("api_url", apiURL))

	// 创建HTTP请求
	httpReq, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewReader(reqBody))
	if err != nil {
		utils.Error("创建HTTP请求失败", zap.Error(err))
		sendSSEError(c, "创建请求失败")
		return
	}

	// 设置请求头
	setRequestHeaders(httpReq, provider, apiKey)
	utils.Info("设置请求头完成", zap.String("provider_kind", provider.APIKind))

	// 发送请求
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	utils.Info("开始发送API请求")
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.Error("API请求失败", zap.Error(err), zap.String("provider", provider.Name))
		sendSSEError(c, fmt.Sprintf("API调用失败: %v", err))
		return
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			utils.Warn("关闭响应体失败", zap.Error(err))
		}
	}()

	utils.Info("收到API响应", zap.Int("status_code", resp.StatusCode))

	// 检查响应状态码
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		utils.Error("API返回错误状态码", zap.Int("status", resp.StatusCode), zap.String("body", string(body)), zap.String("api_url", apiURL))
		// 如果是404错误，提供更详细的错误信息
		if resp.StatusCode == http.StatusNotFound {
			sendSSEError(c, fmt.Sprintf("API返回404错误，请检查Ollama服务是否运行且支持OpenAI兼容模式，以及模型名称是否正确。请求URL: %s", apiURL))
		} else {
			sendSSEError(c, fmt.Sprintf("API返回错误: %d", resp.StatusCode))
		}
		return
	}

	utils.Info("开始处理流式响应", zap.String("provider_kind", provider.APIKind))

	// 根据Provider类型处理不同的流式响应格式
	switch provider.APIKind {
	case "Ollama":
		// 如果是Ollama且URL包含/v1，使用OpenAI格式处理
		if strings.Contains(provider.APIURL, "/v1") {
			utils.Debug("使用OpenAI格式处理Ollama流式响应")
			handleOpenAIStreamResponse(c, resp)
		} else {
			// Ollama原生格式处理
			utils.Debug("使用Ollama原生格式处理流式响应")
			handleOllamaStreamResponse(c, resp)
		}
	default:
		// OpenAI兼容格式处理
		utils.Debug("使用OpenAI兼容格式处理流式响应")
		handleOpenAIStreamResponse(c, resp)
	}
}

// handleOpenAIStreamResponse 处理OpenAI格式的流式响应
func handleOpenAIStreamResponse(c *app.RequestContext, resp *http.Response) {
	utils.Info("开始处理OpenAI格式流式响应")

	// 读取流式响应
	scanner := bufio.NewScanner(resp.Body)
	var contentLength int
	messageCount := 0

	for scanner.Scan() {
		line := scanner.Text()

		// 跳过空行
		if line == "" {
			continue
		}

		// SSE格式：data: {...}
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")

			// OpenAI在流结束时发送 [DONE]
			if data == "[DONE]" {
				utils.Info("收到流结束信号[DONE]", zap.Int("message_count", messageCount), zap.Int("content_length", contentLength))
				sendSSEData(c, map[string]interface{}{
					"done": true,
				})
				break
			}

			// 解析并转发流式数据
			var streamResp OpenAIStreamResponse
			if err := json.Unmarshal([]byte(data), &streamResp); err != nil {
				utils.Error("解析流响应失败", zap.Error(err), zap.String("data", data))
				continue
			}

			messageCount++

			// 提取内容并发送
			if len(streamResp.Choices) > 0 {
				content := streamResp.Choices[0].Delta.Content
				if content != "" {
					// 清理HTML标签，防止前端显示问题
					cleanContent := content
					// 移除HTML标签
					re := regexp.MustCompile(`<[^>]*>`)
					cleanContent = re.ReplaceAllString(cleanContent, "")
					contentLength += len(cleanContent)
					sendSSEData(c, map[string]interface{}{
						"content": cleanContent,
						"done":    false,
					})
					utils.Debug("发送流数据片段", zap.Int("length", len(cleanContent)))
				}

				// 检查是否完成
				if streamResp.Choices[0].FinishReason != "" {
					utils.Info("流响应完成",
						zap.String("finish_reason", streamResp.Choices[0].FinishReason),
						zap.Int("message_count", messageCount),
						zap.Int("content_length", contentLength))
					sendSSEData(c, map[string]interface{}{
						"done": true,
					})
					break
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		utils.Error("读取流数据失败", zap.Error(err))
		sendSSEError(c, "读取流数据失败")
	}

	utils.Info("OpenAI格式流式生成处理完成",
		zap.Int("message_count", messageCount),
		zap.Int("content_length", contentLength))
}

// handleOllamaStreamResponse 处理Ollama原生格式的流式响应
func handleOllamaStreamResponse(c *app.RequestContext, resp *http.Response) {
	utils.Info("开始处理Ollama原生格式流式响应")

	// 读取流式响应
	scanner := bufio.NewScanner(resp.Body)
	var contentLength int
	messageCount := 0

	for scanner.Scan() {
		line := scanner.Text()

		// 跳过空行
		if line == "" {
			continue
		}

		// Ollama原生格式：每行都是一个独立的JSON对象
		var ollamaResp map[string]interface{}
		if err := json.Unmarshal([]byte(line), &ollamaResp); err != nil {
			utils.Error("解析Ollama流响应失败", zap.Error(err), zap.String("data", line))
			continue
		}

		messageCount++

		// 提取内容并发送
		if response, ok := ollamaResp["response"].(string); ok && response != "" {
			// 清理HTML标签，防止前端显示问题
			re := regexp.MustCompile(`<[^>]*>`)
			cleanResponse := re.ReplaceAllString(response, "")
			contentLength += len(cleanResponse)
			sendSSEData(c, map[string]interface{}{
				"content": cleanResponse,
				"done":    false,
			})
			utils.Debug("发送Ollama流数据片段", zap.Int("length", len(cleanResponse)))
		}

		// 检查是否完成
		if done, ok := ollamaResp["done"].(bool); ok && done {
			utils.Info("Ollama流响应完成",
				zap.Int("message_count", messageCount),
				zap.Int("content_length", contentLength))
			sendSSEData(c, map[string]interface{}{
				"done": true,
			})
			break
		}
	}

	if err := scanner.Err(); err != nil {
		utils.Error("读取Ollama流数据失败", zap.Error(err))
		sendSSEError(c, "读取流数据失败")
	}

	utils.Info("Ollama原生格式流式生成处理完成",
		zap.Int("message_count", messageCount),
		zap.Int("content_length", contentLength))
}

// handleNonStreamGeneration 处理非流式生成
func handleNonStreamGeneration(ctx context.Context, c *app.RequestContext, provider *models.APIProvider, apiKey, model string, req GenerateRequest) {
	// 构建API URL
	apiURL := buildAPIURL(provider)
	utils.Info("开始处理非流式生成请求",
		zap.Uint("provider_id", provider.ID),
		zap.String("provider_name", provider.Name),
		zap.String("model", model),
		zap.String("provider_kind", provider.APIKind),
		zap.String("api_url", apiURL))

	// 构建请求体
	reqBody, err := buildRequestBody(provider, model, req.Prompt, req.Temperature, req.MaxTokens, false)
	if err != nil {
		utils.Error("请求体构建失败", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "请求体构建失败")
		return
	}

	utils.Debug("构建请求体成功", zap.String("request_body", string(reqBody)))
	utils.Info("构建API URL", zap.String("api_url", apiURL))

	// 创建HTTP请求
	httpReq, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewReader(reqBody))
	if err != nil {
		utils.Error("创建HTTP请求失败", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "创建请求失败")
		return
	}

	// 设置请求头
	setRequestHeaders(httpReq, provider, apiKey)
	utils.Info("设置请求头完成", zap.String("provider_kind", provider.APIKind))

	// 发送请求
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	utils.Info("开始发送API请求")
	resp, err := client.Do(httpReq)
	if err != nil {
		utils.Error("API请求失败", zap.Error(err), zap.String("provider", provider.Name))
		utils.ResponseError(&ctx, c, utils.CodeServerError, fmt.Sprintf("API调用失败: %v", err))
		return
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			utils.Warn("关闭响应体失败", zap.Error(err))
		}
	}()

	utils.Info("收到API响应", zap.Int("status_code", resp.StatusCode))

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		utils.Error("读取响应失败", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "读取响应失败")
		return
	}

	utils.Debug("读取响应体成功", zap.Int("body_length", len(body)))

	// 检查响应状态码
	if resp.StatusCode != http.StatusOK {
		utils.Error("API返回错误状态码", zap.Int("status", resp.StatusCode), zap.String("body", string(body)), zap.String("api_url", apiURL))
		// 如果是404错误，提供更详细的错误信息
		if resp.StatusCode == http.StatusNotFound {
			utils.ResponseError(&ctx, c, utils.CodeServerError, fmt.Sprintf("API返回404错误，请检查Ollama服务是否运行且支持OpenAI兼容模式，以及模型名称是否正确。请求URL: %s", apiURL))
		} else {
			utils.ResponseError(&ctx, c, utils.CodeServerError, fmt.Sprintf("API返回错误: %d", resp.StatusCode))
		}
		return
	}

	// 根据Provider类型解析不同的响应格式
	switch provider.APIKind {
	case "Ollama":
		// 如果是Ollama且URL包含/v1，使用OpenAI格式解析
		if strings.Contains(provider.APIURL, "/v1") {
			parseOpenAIResponse(ctx, c, body)
		} else {
			// Ollama原生格式解析
			parseOllamaResponse(ctx, c, body)
		}
	default:
		// OpenAI兼容格式解析
		parseOpenAIResponse(ctx, c, body)
	}
}

// parseOpenAIResponse 解析OpenAI格式的响应
func parseOpenAIResponse(ctx context.Context, c *app.RequestContext, body []byte) {
	utils.Info("开始解析OpenAI格式响应")

	// 解析响应
	var openaiResp OpenAIResponse
	if err := json.Unmarshal(body, &openaiResp); err != nil {
		utils.Error("解析OpenAI响应失败", zap.Error(err), zap.String("body", string(body)))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "解析响应失败")
		return
	}

	utils.Info("解析OpenAI响应成功",
		zap.String("response_id", openaiResp.ID),
		zap.String("response_model", openaiResp.Model))

	// 提取生成的内容
	if len(openaiResp.Choices) == 0 {
		utils.Warn("OpenAI API未返回内容")
		utils.ResponseError(&ctx, c, utils.CodeServerError, "API未返回内容")
		return
	}

	content := openaiResp.Choices[0].Message.Content
	// 清理HTML标签，防止前端显示问题
	re := regexp.MustCompile(`<[^>]*>`)
	cleanContent := re.ReplaceAllString(content, "")
	utils.Info("提取OpenAI生成内容成功",
		zap.Int("content_length", len(cleanContent)),
		zap.Int("prompt_tokens", openaiResp.Usage.PromptTokens),
		zap.Int("completion_tokens", openaiResp.Usage.CompletionTokens),
		zap.Int("total_tokens", openaiResp.Usage.TotalTokens))

	utils.SuccessWithMessage(&ctx, c, "生成成功", map[string]interface{}{
		"content": cleanContent,
		"usage":   openaiResp.Usage,
	})
}

// parseOllamaResponse 解析Ollama原生格式的响应
func parseOllamaResponse(ctx context.Context, c *app.RequestContext, body []byte) {
	utils.Info("开始解析Ollama原生格式响应")

	// 解析响应
	var ollamaResp map[string]interface{}
	if err := json.Unmarshal(body, &ollamaResp); err != nil {
		utils.Error("解析Ollama响应失败", zap.Error(err), zap.String("body", string(body)))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "解析响应失败")
		return
	}

	utils.Info("解析Ollama响应成功", zap.Any("response_keys", getMapKeys(ollamaResp)))

	// 提取生成的内容
	response, ok := ollamaResp["response"].(string)
	if !ok || response == "" {
		utils.Warn("Ollama API未返回内容")
		utils.ResponseError(&ctx, c, utils.CodeServerError, "API未返回内容")
		return
	}

	// 清理HTML标签，防止前端显示问题
	re := regexp.MustCompile(`<[^>]*>`)
	content := re.ReplaceAllString(response, "")
	utils.Info("提取Ollama生成内容成功", zap.Int("content_length", len(content)))

	// Ollama原生格式可能不包含详细的token统计信息，所以我们创建一个简单的响应
	usage := map[string]interface{}{}
	if promptEvalCount, ok := ollamaResp["prompt_eval_count"].(float64); ok {
		usage["prompt_tokens"] = int(promptEvalCount)
	}
	if evalCount, ok := ollamaResp["eval_count"].(float64); ok {
		usage["completion_tokens"] = int(evalCount)
		if promptEvalCount, pok := ollamaResp["prompt_eval_count"].(float64); pok {
			total := int(promptEvalCount) + int(evalCount)
			usage["total_tokens"] = total
		}
	}

	utils.SuccessWithMessage(&ctx, c, "生成成功", map[string]interface{}{
		"content": content,
		"usage":   usage,
	})
}

// getMapKeys 获取map的键列表（用于日志记录）
func getMapKeys(m map[string]interface{}) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// buildAPIURL 根据Provider类型构建API URL
func buildAPIURL(provider *models.APIProvider) string {
	baseURL := strings.TrimRight(provider.APIURL, "/")

	// 根据Provider类型和URL格式选择合适的端点
	switch provider.APIKind {
	case "Google Gemini":
		// Google Gemini使用不同的API端点
		url := fmt.Sprintf("%s/models/%s:generateContent", baseURL, provider.APIModel)
		utils.Debug("构建Google Gemini API URL", zap.String("url", url))
		return url
	case "Ollama":
		// Ollama 也支持 OpenAI 兼容格式
		// 如果 api_url 包含 /v1，使用 OpenAI 格式
		if strings.Contains(baseURL, "/v1") {
			url := fmt.Sprintf("%s/chat/completions", baseURL)
			utils.Debug("构建Ollama OpenAI兼容模式URL", zap.String("url", url))
			return url
		}
		// 否则使用 Ollama 原生格式
		url := fmt.Sprintf("%s/api/generate", baseURL)
		utils.Debug("构建Ollama原生模式URL", zap.String("url", url))
		return url
	default:
		// OpenAI兼容格式（适用于大部分Provider）
		url := fmt.Sprintf("%s/chat/completions", baseURL)
		utils.Debug("构建OpenAI兼容模式URL", zap.String("url", url))
		return url
	}
}

// buildRequestBody 构建请求体
func buildRequestBody(provider *models.APIProvider, model, prompt string, temperature float32, maxTokens int, stream bool) ([]byte, error) {
	utils.Debug("开始构建请求体", zap.String("provider_kind", provider.APIKind), zap.String("model", model), zap.String("prompt_preview", truncateString(prompt, 50)))

	// 根据Provider类型构建不同的请求体
	switch provider.APIKind {
	case "Ollama":
		// Ollama原生格式
		// 如果URL包含/v1，使用OpenAI格式
		if strings.Contains(provider.APIURL, "/v1") {
			utils.Debug("构建Ollama OpenAI兼容格式请求体")
			// OpenAI兼容格式
			openaiReq := OpenAIRequest{
				Model: model,
				Messages: []OpenAIMessage{
					{
						Role:    "user",
						Content: prompt,
					},
				},
				Temperature: temperature,
				MaxTokens:   maxTokens,
				Stream:      stream,
			}
			data, err := json.Marshal(openaiReq)
			if err != nil {
				utils.Error("序列化OpenAI请求体失败", zap.Error(err))
				return nil, err
			}
			utils.Debug("构建OpenAI请求体成功", zap.String("request_body", string(data)))
			return data, nil
		}

		utils.Debug("构建Ollama原生格式请求体")
		// Ollama原生格式
		ollamaReq := map[string]interface{}{
			"model":       model,
			"prompt":      prompt,
			"temperature": temperature,
			"stream":      stream,
		}
		data, err := json.Marshal(ollamaReq)
		if err != nil {
			utils.Error("序列化Ollama请求体失败", zap.Error(err))
			return nil, err
		}
		utils.Debug("构建Ollama请求体成功", zap.String("request_body", string(data)))
		return data, nil
	default:
		utils.Debug("构建OpenAI兼容格式请求体")
		// OpenAI兼容格式（适用于大部分Provider）
		openaiReq := OpenAIRequest{
			Model: model,
			Messages: []OpenAIMessage{
				{
					Role:    "user",
					Content: prompt,
				},
			},
			Temperature: temperature,
			MaxTokens:   maxTokens,
			Stream:      stream,
		}
		data, err := json.Marshal(openaiReq)
		if err != nil {
			utils.Error("序列化OpenAI请求体失败", zap.Error(err))
			return nil, err
		}
		utils.Debug("构建OpenAI请求体成功", zap.String("request_body", string(data)))
		return data, nil
	}
}

// setRequestHeaders 设置请求头
func setRequestHeaders(req *http.Request, provider *models.APIProvider, apiKey string) {
	utils.Debug("开始设置请求头", zap.String("provider_kind", provider.APIKind), zap.String("api_url", req.URL.String()))
	req.Header.Set("Content-Type", "application/json")

	// 根据Provider类型设置认证头
	switch provider.APIKind {
	case "Google Gemini":
		// Google Gemini使用API Key作为查询参数
		q := req.URL.Query()
		q.Set("key", apiKey)
		req.URL.RawQuery = q.Encode()
		utils.Debug("设置Google Gemini请求头", zap.String("query", req.URL.RawQuery))
	case "Anthropic":
		// Anthropic使用x-api-key头
		req.Header.Set("x-api-key", apiKey)
		req.Header.Set("anthropic-version", "2023-06-01")
		utils.Debug("设置Anthropic请求头", zap.String("x-api-key", apiKey))
	case "Ollama":
		// Ollama通常不需要认证头，除非有特殊配置
		// 如果URL包含/v1，使用OpenAI格式的认证
		if strings.Contains(provider.APIURL, "/v1") {
			req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
			utils.Debug("设置Ollama OpenAI兼容模式请求头", zap.String("Authorization", fmt.Sprintf("Bearer %s", apiKey)))
		} else {
			utils.Debug("Ollama原生模式无需认证头")
		}
		// 否则Ollama原生格式通常不需要认证头
	default:
		// OpenAI兼容格式（适用于大部分Provider）
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
		utils.Debug("设置OpenAI兼容模式请求头", zap.String("Authorization", fmt.Sprintf("Bearer %s", apiKey)))
	}
}

// sendSSEData 发送SSE数据
func sendSSEData(c *app.RequestContext, data map[string]interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return
	}

	c.Write([]byte(fmt.Sprintf("data: %s\n\n", jsonData)))
	c.Flush()
}

// sendSSEError 发送SSE错误
func sendSSEError(c *app.RequestContext, message string) {
	sendSSEData(c, map[string]interface{}{
		"error": message,
		"done":  true,
	})
}
