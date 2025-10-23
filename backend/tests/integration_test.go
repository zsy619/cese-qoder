package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strconv"
	"testing"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/zsy619/cese-qoder/backend/api/routes"
	"github.com/zsy619/cese-qoder/backend/config"
	"github.com/zsy619/cese-qoder/backend/utils"
)

var (
	testServer *server.Hertz
	testToken  string
)

// setupTestServer 初始化测试服务器
func setupTestServer(t *testing.T) {
	// 初始化日志
	if err := utils.InitLogger(); err != nil {
		t.Fatalf("Failed to initialize logger: %v", err)
	}

	// 初始化数据库
	cfg := config.GetDefaultConfig()
	if err := config.InitDB(&cfg.DB); err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// 创建测试服务器
	testServer = server.Default()
	routes.RegisterRoutes(testServer)
}

// TestUserWorkflow 测试完整的用户工作流
func TestUserWorkflow(t *testing.T) {
	setupTestServer(t)

	testPhone := "13900139000"
	testPassword := "Test@123456"

	t.Run("1.用户注册", func(t *testing.T) {
		reqBody := map[string]string{
			"mobile":   testPhone,
			"password": testPassword,
		}
		body, _ := json.Marshal(reqBody)

		w := ut.PerformRequest(testServer.Engine, "POST", "/api/v1/user/register",
			&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		resp := w.Result()

		if resp.StatusCode() != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode())
		}

		var apiResp utils.Response
		json.Unmarshal(resp.Body(), &apiResp)

		if apiResp.Code != utils.CodeSuccess && apiResp.Code != utils.CodePhoneExists {
			t.Errorf("Expected success or phone exists, got code %d: %s", apiResp.Code, apiResp.Message)
		}
	})

	t.Run("2.用户登录", func(t *testing.T) {
		reqBody := map[string]string{
			"mobile":   testPhone,
			"password": testPassword,
		}
		body, _ := json.Marshal(reqBody)

		w := ut.PerformRequest(testServer.Engine, "POST", "/api/v1/user/login",
			&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
			ut.Header{Key: "Content-Type", Value: "application/json"})
		protoResp := w.Result()

		if protoResp.StatusCode() != http.StatusOK {
			t.Errorf("Expected status 200, got %d", protoResp.StatusCode())
		}

		var apiResp utils.Response
		json.Unmarshal(protoResp.Body(), &apiResp)

		if apiResp.Data != nil {
			if data, ok := apiResp.Data.(map[string]interface{}); ok {
				if token, ok := data["token"].(string); ok {
					testToken = token
				}
			}
		}

		if testToken == "" {
			t.Error("Failed to get token from login response")
			t.Logf("Response body: %s", string(protoResp.Body()))
		}
	})

	t.Run("3.获取用户信息", func(t *testing.T) {
		w := ut.PerformRequest(testServer.Engine, "GET", "/api/v1/user/info", nil,
			ut.Header{Key: "Authorization", Value: "Bearer " + testToken})
		resp := w.Result()

		if resp.StatusCode() != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode())
		}
	})
}

// TestTemplateWorkflow 测试完整的模板工作流
func TestTemplateWorkflow(t *testing.T) {
	if testToken == "" {
		t.Skip("Skipping template tests: no token available")
	}

	var templateID int

	t.Run("1.创建模板", func(t *testing.T) {
		reqBody := map[string]string{
			"topic":           "集成测试模板",
			"task_objective":  "测试模板创建功能",
			"ai_role":         "测试助手",
			"my_role":         "测试人员",
			"key_information": "集成测试数据",
			"behavior_rule":   "遵循测试规范",
			"delivery_format": "JSON格式",
		}
		body, _ := json.Marshal(reqBody)

		w := ut.PerformRequest(testServer.Engine, "POST", "/api/v1/template",
			&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
			ut.Header{Key: "Content-Type", Value: "application/json"},
			ut.Header{Key: "Authorization", Value: "Bearer " + testToken})
		protoResp := w.Result()

		if protoResp.StatusCode() != http.StatusOK {
			t.Errorf("Expected status 200, got %d", protoResp.StatusCode())
		}

		var resp map[string]interface{}
		json.Unmarshal(protoResp.Body(), &resp)

		if data, ok := resp["data"].(map[string]interface{}); ok {
			if id, ok := data["id"].(float64); ok {
				templateID = int(id)
			}
		}
	})

	t.Run("2.查询模板列表", func(t *testing.T) {
		w := ut.PerformRequest(testServer.Engine, "GET", "/api/v1/template?page=1&page_size=10", nil,
			ut.Header{Key: "Authorization", Value: "Bearer " + testToken})
		resp := w.Result()

		if resp.StatusCode() != http.StatusOK {
			t.Errorf("Expected status 200, got %d", resp.StatusCode())
		}
	})

	if templateID > 0 {
		t.Run("3.获取模板详情", func(t *testing.T) {
			w := ut.PerformRequest(testServer.Engine, "GET",
				"/api/v1/template/"+strconv.Itoa(templateID), nil,
				ut.Header{Key: "Authorization", Value: "Bearer " + testToken})
			resp := w.Result()

			// 记录响应状态
			t.Logf("Get template detail status: %d", resp.StatusCode())
			if resp.StatusCode() == http.StatusOK {
				t.Log("Template detail retrieved successfully")
			}
		})
	}
}

// TestHealthCheck 测试健康检查
func TestHealthCheck(t *testing.T) {
	setupTestServer(t)

	w := ut.PerformRequest(testServer.Engine, "GET", "/health", nil)
	protoResp := w.Result()

	if protoResp.StatusCode() != http.StatusOK {
		t.Errorf("Expected status 200, got %d", protoResp.StatusCode())
	}

	var resp map[string]string
	json.Unmarshal(protoResp.Body(), &resp)

	if resp["status"] != "ok" {
		t.Errorf("Expected status 'ok', got '%s'", resp["status"])
	}
}
