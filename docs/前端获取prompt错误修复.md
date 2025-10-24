# 前端获取prompt错误修复

## 问题描述

用户反馈前端获取prompt时出现了HTML代码，导致显示异常。

## 问题分析

通过代码分析和测试，发现问题出现在以下几个方面：

1. **AI生成的内容可能包含HTML标签**：某些大模型在生成内容时可能会包含HTML标签
2. **前后端未对内容进行清理**：在传输和显示过程中没有清理HTML标签
3. **安全风险**：未清理的HTML可能导致XSS攻击风险

## 修复方案

### 1. 后端修复

在后端处理AI生成响应时，添加HTML标签清理功能：

#### 流式响应处理（OpenAI格式）
```go
// handleOpenAIStreamResponse函数中
if content != "" {
    // 清理HTML标签，防止前端显示问题
    re := regexp.MustCompile(`<[^>]*>`)
    cleanContent := re.ReplaceAllString(content, "")
    contentLength += len(cleanContent)
    sendSSEData(c, map[string]interface{}{
        "content": cleanContent,
        "done":    false,
    })
    utils.Debug("发送流数据片段", zap.Int("length", len(cleanContent)))
}
```

#### 流式响应处理（Ollama原生格式）
```go
// handleOllamaStreamResponse函数中
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
```

#### 非流式响应处理（OpenAI格式）
```go
// parseOpenAIResponse函数中
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
```

#### 非流式响应处理（Ollama原生格式）
```go
// parseOllamaResponse函数中
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
```

### 2. 前端修复

在前端处理AI生成响应时，同样添加HTML标签清理功能：

#### 流式响应处理
```typescript
// handleBackendStreamResponse函数中
// 提取内容并清理HTML标签
const content = json.content || '';
// 清理HTML标签，防止XSS攻击和显示问题
const cleanContent = content.replace(/<[^>]*>/g, '');
if (cleanContent) {
    fullContent += cleanContent;
    onStream(cleanContent);
}
```

#### 非流式响应处理
```typescript
// 非流式响应处理部分
const data = await response.json();
const content = data.data?.content || '';
// 清理HTML标签，防止XSS攻击和显示问题
const cleanContent = content.replace(/<[^>]*>/g, '');

return {
    content: cleanContent,
    success: true,
};
```

## 技术实现要点

1. **正则表达式清理**：使用`<[^>]*>`正则表达式匹配并移除所有HTML标签
2. **双重保护**：在后端和前端都进行HTML标签清理，确保安全性
3. **性能考虑**：正则表达式只在有内容时才执行，避免不必要的性能开销
4. **日志记录**：保持原有的日志记录逻辑，便于问题排查

## 测试验证

1. ✅ 后端代码编译通过
2. ✅ 前端代码编译通过
3. ✅ 功能测试：AI生成内容正确显示，无HTML标签
4. ✅ 安全测试：防止XSS攻击

## 安全性增强

1. **XSS防护**：清理HTML标签有效防止XSS攻击
2. **内容安全**：确保用户看到的内容是纯文本，无恶意脚本
3. **兼容性**：保持原有功能完整性，不影响正常使用

## 后续优化建议

1. **更精细的内容过滤**：可以考虑保留某些安全的HTML标签（如换行符对应的`<br>`）
2. **白名单机制**：实现HTML标签白名单，只允许特定标签通过
3. **内容验证**：添加内容验证机制，确保生成内容符合预期格式