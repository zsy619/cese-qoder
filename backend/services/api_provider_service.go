package services

import (
	"errors"

	"github.com/zsy619/cese-qoder/backend/config"
	"github.com/zsy619/cese-qoder/backend/models"
	"github.com/zsy619/cese-qoder/backend/utils"
)

// CreateAPIProvider 创建API Provider配置
func CreateAPIProvider(userMobile string, req *models.APIProviderCreateRequest) (*models.APIProvider, error) {
	// 验证用户存在
	if _, err := GetUserByMobile(userMobile); err != nil {
		return nil, err
	}

	// 加密API Key（使用SM4加密）
	encryptionKey, err := getOrCreateEncryptionKey()
	if err != nil {
		return nil, err
	}

	encryptedKey, err := utils.EncryptData(req.APIKey, encryptionKey)
	if err != nil {
		return nil, err
	}

	// 创建Provider
	provider := &models.APIProvider{
		Mobile:     userMobile,
		Name:       req.Name,
		APIKind:    req.APIKind,
		APIKey:     encryptedKey,
		APIURL:     req.APIURL,
		APIModel:   req.APIModel,
		APIVersion: req.APIVersion,
		APIStatus:  1,           // 默认启用
		APIOpen:    req.APIOpen, // 私有/公开
		APIRemark:  req.APIRemark,
	}

	if req.APIVersion == "" {
		provider.APIVersion = "v1"
	}

	db := config.GetDB()
	if err := db.Create(provider).Error; err != nil {
		return nil, err
	}

	return provider, nil
}

// GetAPIProvider 获取单个API Provider
func GetAPIProvider(userMobile string, providerID uint) (*models.APIProvider, error) {
	var provider models.APIProvider
	db := config.GetDB()
	if err := db.Where("id = ? AND mobile = ?", providerID, userMobile).First(&provider).Error; err != nil {
		return nil, errors.New("Provider not found")
	}

	return &provider, nil
}

// ListAPIProviders 获取用户的所有API Provider
func ListAPIProviders(userMobile string, status *int8) ([]models.APIProvider, error) {
	var providers []models.APIProvider
	db := config.GetDB()
	query := db.Where("mobile = ?", userMobile)

	if status != nil {
		query = query.Where("api_status = ?", *status)
	}

	if err := query.Order("created_at DESC").Find(&providers).Error; err != nil {
		return nil, err
	}

	return providers, nil
}

// ListAvailableProviders 获取用户可用的API Provider列表（包括自己私有的和公开的）
func ListAvailableProviders(userMobile string) ([]models.APIProvider, error) {
	var providers []models.APIProvider
	db := config.GetDB()

	// 构建查询：(自己的私有Provider且启用) OR (公开的Provider且启用)
	query := db.Where("api_status = ?", 1)

	// 添加条件：自己私有的 OR 公开的
	query = query.Where("(mobile = ? AND api_open = 0) OR api_open = 1", userMobile)

	// 排序：先私有（自己的），再公开，最后按创建时间倒序
	query = query.Order("(CASE WHEN mobile = '" + userMobile + "' THEN 0 ELSE 1 END), created_at DESC")

	if err := query.Find(&providers).Error; err != nil {
		return nil, err
	}

	// 去重（虽然正常情况不应该有重复）
	seenIDs := make(map[uint]bool)
	uniqueProviders := []models.APIProvider{}
	for _, p := range providers {
		if !seenIDs[p.ID] {
			seenIDs[p.ID] = true
			uniqueProviders = append(uniqueProviders, p)
		}
	}

	return uniqueProviders, nil
}

// UpdateAPIProvider 更新API Provider
func UpdateAPIProvider(userMobile string, providerID uint, req *models.APIProviderUpdateRequest) error {
	provider, err := GetAPIProvider(userMobile, providerID)
	if err != nil {
		return err
	}

	db := config.GetDB()
	updates := make(map[string]interface{})

	if req.Name != "" {
		updates["name"] = req.Name
	}

	if req.APIKind != "" {
		updates["api_kind"] = req.APIKind
	}

	if req.APIKey != "" {
		// 加密新的API Key
		encryptionKey, err := getOrCreateEncryptionKey()
		if err != nil {
			return err
		}
		encryptedKey, err := utils.EncryptData(req.APIKey, encryptionKey)
		if err != nil {
			return err
		}
		updates["api_key"] = encryptedKey
	}

	if req.APIModel != "" {
		updates["api_model"] = req.APIModel
	}

	if req.APIVersion != "" {
		updates["api_version"] = req.APIVersion
	}

	if req.APIStatus != nil {
		updates["api_status"] = *req.APIStatus
	}

	if req.APIOpen != nil {
		updates["api_open"] = *req.APIOpen
	}

	if req.APIRemark != "" {
		updates["api_remark"] = req.APIRemark
	}

	if len(updates) == 0 {
		return errors.New("no fields to update")
	}

	return db.Model(provider).Updates(updates).Error
}

// DeleteAPIProvider 删除API Provider
func DeleteAPIProvider(userMobile string, providerID uint) error {
	provider, err := GetAPIProvider(userMobile, providerID)
	if err != nil {
		return err
	}

	db := config.GetDB()
	return db.Delete(provider).Error
}

// GetDecryptedAPIKey 获取解密后的API Key（内部使用）
func GetDecryptedAPIKey(provider *models.APIProvider) (string, error) {
	encryptionKey, err := getOrCreateEncryptionKey()
	if err != nil {
		return "", err
	}

	return utils.DecryptData(provider.APIKey, encryptionKey)
}

// getOrCreateEncryptionKey 获取或创建加密密钥
// 实际应用中应从配置文件或密钥管理服务获取
func getOrCreateEncryptionKey() ([]byte, error) {
	// TODO: 从配置或KMS获取密钥
	// 这里使用固定密钥仅供示例，生产环境必须使用安全的密钥管理
	key := []byte("cese-encryption1") // 16字节
	return key, nil
}
