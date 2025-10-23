package services

import (
	"testing"

	"github.com/zsy619/cese-qoder/backend/config"
	"github.com/zsy619/cese-qoder/backend/models"
	"github.com/zsy619/cese-qoder/backend/utils"
)

// 初始化测试环境
func setupAPIProviderTest(t *testing.T) {
	// 初始化日志
	if err := utils.InitLogger(); err != nil {
		t.Fatalf("Failed to initialize logger: %v", err)
	}

	// 初始化数据库
	cfg := config.GetDefaultConfig()
	if err := config.InitDB(&cfg.DB); err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}
}

func TestCreateAPIProvider(t *testing.T) {
	setupAPIProviderTest(t)

	// 创建测试用户
	testMobile := "13900139001"
	testPassword := "Test@123456"

	hashedPassword, _ := utils.HashPassword(testPassword)
	user := &models.User{
		Mobile:   testMobile,
		Password: hashedPassword,
	}

	db := config.GetDB()
	db.Create(user)
	defer db.Delete(user) // 测试结束后清理

	// 测试创建API Provider
	req := &models.APIProviderCreateRequest{
		Name:      "DeepSeek Test",
		APIKey:    "sk-test-key-123456",
		APIURL:    "https://api.deepseek.com",
		APIModel:  "deepseek-chat",
		APIRemark: "测试Provider",
	}

	provider, err := CreateAPIProvider(testMobile, req)
	if err != nil {
		t.Fatalf("CreateAPIProvider() error = %v", err)
	}

	if provider == nil {
		t.Fatal("CreateAPIProvider() returned nil provider")
	}

	if provider.Name != req.Name {
		t.Errorf("CreateAPIProvider() Name = %v, want %v", provider.Name, req.Name)
	}

	// 清理
	defer db.Delete(provider)
}

func TestListAPIProviders(t *testing.T) {
	setupAPIProviderTest(t)

	// 创建测试用户
	testMobile := "13900139002"
	testPassword := "Test@123456"

	hashedPassword, _ := utils.HashPassword(testPassword)
	user := &models.User{
		Mobile:   testMobile,
		Password: hashedPassword,
	}

	db := config.GetDB()
	db.Create(user)
	defer db.Delete(user)

	// 创建多个Provider
	providers := []models.APIProviderCreateRequest{
		{
			Name:     "Provider 1",
			APIKey:   "key1",
			APIURL:   "https://api1.com",
			APIModel: "gpt-4",
		},
		{
			Name:     "Provider 2",
			APIKey:   "key2",
			APIURL:   "https://api2.com",
			APIModel: "deepseek-chat",
		},
	}

	createdProviders := make([]*models.APIProvider, 0)
	for _, req := range providers {
		p, err := CreateAPIProvider(testMobile, &req)
		if err != nil {
			t.Fatalf("CreateAPIProvider() error = %v", err)
		}
		createdProviders = append(createdProviders, p)
	}

	// 清理
	defer func() {
		for _, p := range createdProviders {
			db.Delete(p)
		}
	}()

	// 测试获取所有Provider
	list, err := ListAPIProviders(testMobile, nil)
	if err != nil {
		t.Fatalf("ListAPIProviders() error = %v", err)
	}

	if len(list) < 2 {
		t.Errorf("ListAPIProviders() got %d providers, want at least 2", len(list))
	}
}

func TestUpdateAPIProvider(t *testing.T) {
	setupAPIProviderTest(t)

	// 创建测试用户和Provider
	testMobile := "13900139003"
	testPassword := "Test@123456"

	hashedPassword, _ := utils.HashPassword(testPassword)
	user := &models.User{
		Mobile:   testMobile,
		Password: hashedPassword,
	}

	db := config.GetDB()
	db.Create(user)
	defer db.Delete(user)

	// 创建Provider
	createReq := &models.APIProviderCreateRequest{
		Name:     "Original Name",
		APIKey:   "original-key",
		APIURL:   "https://original.com",
		APIModel: "gpt-3.5",
	}

	provider, err := CreateAPIProvider(testMobile, createReq)
	if err != nil {
		t.Fatalf("CreateAPIProvider() error = %v", err)
	}
	defer db.Delete(provider)

	// 测试更新
	updateReq := &models.APIProviderUpdateRequest{
		Name:     "Updated Name",
		APIModel: "gpt-4",
	}

	err = UpdateAPIProvider(testMobile, provider.ID, updateReq)
	if err != nil {
		t.Fatalf("UpdateAPIProvider() error = %v", err)
	}

	// 验证更新
	updated, err := GetAPIProvider(testMobile, provider.ID)
	if err != nil {
		t.Fatalf("GetAPIProvider() after update error = %v", err)
	}

	if updated.Name != updateReq.Name {
		t.Errorf("UpdateAPIProvider() Name = %v, want %v", updated.Name, updateReq.Name)
	}

	if updated.APIModel != updateReq.APIModel {
		t.Errorf("UpdateAPIProvider() APIModel = %v, want %v", updated.APIModel, updateReq.APIModel)
	}
}

func TestDeleteAPIProvider(t *testing.T) {
	setupAPIProviderTest(t)

	// 创建测试用户和Provider
	testMobile := "13900139004"
	testPassword := "Test@123456"

	hashedPassword, _ := utils.HashPassword(testPassword)
	user := &models.User{
		Mobile:   testMobile,
		Password: hashedPassword,
	}

	db := config.GetDB()
	db.Create(user)
	defer db.Delete(user)

	// 创建Provider
	createReq := &models.APIProviderCreateRequest{
		Name:     "To Delete",
		APIKey:   "delete-key",
		APIURL:   "https://delete.com",
		APIModel: "gpt-3.5",
	}

	provider, err := CreateAPIProvider(testMobile, createReq)
	if err != nil {
		t.Fatalf("CreateAPIProvider() error = %v", err)
	}

	providerID := provider.ID

	// 测试删除
	err = DeleteAPIProvider(testMobile, providerID)
	if err != nil {
		t.Fatalf("DeleteAPIProvider() error = %v", err)
	}

	// 验证已删除
	_, err = GetAPIProvider(testMobile, providerID)
	if err == nil {
		t.Error("GetAPIProvider() after delete should return error")
	}
}

func TestEncryptionDecryption(t *testing.T) {
	setupAPIProviderTest(t)

	// 创建测试用户和Provider
	testMobile := "13900139005"
	testPassword := "Test@123456"

	hashedPassword, _ := utils.HashPassword(testPassword)
	user := &models.User{
		Mobile:   testMobile,
		Password: hashedPassword,
	}

	db := config.GetDB()
	db.Create(user)
	defer db.Delete(user)

	// 创建Provider测试加密
	originalAPIKey := "sk-original-api-key-123456"

	createReq := &models.APIProviderCreateRequest{
		Name:     "Encryption Test",
		APIKey:   originalAPIKey,
		APIURL:   "https://api.test.com",
		APIModel: "gpt-4",
	}

	provider, err := CreateAPIProvider(testMobile, createReq)
	if err != nil {
		t.Fatalf("CreateAPIProvider() error = %v", err)
	}
	defer db.Delete(provider)

	// API Key应该被加密存储
	if provider.APIKey == originalAPIKey {
		t.Error("API Key should be encrypted in database")
	}

	// 测试解密
	decryptedKey, err := GetDecryptedAPIKey(provider)
	if err != nil {
		t.Fatalf("GetDecryptedAPIKey() error = %v", err)
	}

	if decryptedKey != originalAPIKey {
		t.Errorf("GetDecryptedAPIKey() = %v, want %v", decryptedKey, originalAPIKey)
	}
}
