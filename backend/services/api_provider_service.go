package services

import (
	"errors"

	"github.com/zsy619/cese-qoder/backend/config"
	"github.com/zsy619/cese-qoder/backend/models"
	"github.com/zsy619/cese-qoder/backend/utils"
)

// CreateAPIProvider 创建API Provider配置
func CreateAPIProvider(userPhone string, req *models.APIProviderCreateRequest) (*models.APIProvider, error) {
	// 获取用户ID
	user, err := GetUserByPhone(userPhone)
	if err != nil {
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

	// 加密API Secret（如果有）
	var encryptedSecret string
	if req.APISecret != "" {
		encryptedSecret, err = utils.EncryptData(req.APISecret, encryptionKey)
		if err != nil {
			return nil, err
		}
	}

	// 创建Provider
	provider := &models.APIProvider{
		UserID:     user.ID,
		Name:       req.Name,
		APIKey:     encryptedKey,
		APISecret:  encryptedSecret,
		APIURL:     req.APIURL,
		APIType:    req.APIType,
		APIModel:   req.APIModel,
		APIVersion: req.APIVersion,
		APIStatus:  1, // 默认启用
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
func GetAPIProvider(userPhone string, providerID uint) (*models.APIProvider, error) {
	user, err := GetUserByPhone(userPhone)
	if err != nil {
		return nil, err
	}

	var provider models.APIProvider
	db := config.GetDB()
	if err := db.Where("id = ? AND user_id = ?", providerID, user.ID).First(&provider).Error; err != nil {
		return nil, errors.New("Provider not found")
	}

	return &provider, nil
}

// ListAPIProviders 获取用户的所有API Provider
func ListAPIProviders(userPhone string, apiType string, status *int8) ([]models.APIProvider, error) {
	user, err := GetUserByPhone(userPhone)
	if err != nil {
		return nil, err
	}

	var providers []models.APIProvider
	db := config.GetDB()
	query := db.Where("user_id = ?", user.ID)

	if apiType != "" {
		query = query.Where("api_type = ?", apiType)
	}

	if status != nil {
		query = query.Where("api_status = ?", *status)
	}

	if err := query.Order("created_at DESC").Find(&providers).Error; err != nil {
		return nil, err
	}

	return providers, nil
}

// UpdateAPIProvider 更新API Provider
func UpdateAPIProvider(userPhone string, providerID uint, req *models.APIProviderUpdateRequest) error {
	provider, err := GetAPIProvider(userPhone, providerID)
	if err != nil {
		return err
	}

	db := config.GetDB()
	updates := make(map[string]interface{})

	if req.Name != "" {
		updates["name"] = req.Name
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

	if req.APISecret != "" {
		// 加密新的API Secret
		encryptionKey, err := getOrCreateEncryptionKey()
		if err != nil {
			return err
		}
		encryptedSecret, err := utils.EncryptData(req.APISecret, encryptionKey)
		if err != nil {
			return err
		}
		updates["api_secret"] = encryptedSecret
	}

	if req.APIURL != "" {
		updates["api_url"] = req.APIURL
	}

	if req.APIType != "" {
		updates["api_type"] = req.APIType
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

	if req.APIRemark != "" {
		updates["api_remark"] = req.APIRemark
	}

	if len(updates) == 0 {
		return errors.New("no fields to update")
	}

	return db.Model(provider).Updates(updates).Error
}

// DeleteAPIProvider 删除API Provider
func DeleteAPIProvider(userPhone string, providerID uint) error {
	provider, err := GetAPIProvider(userPhone, providerID)
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

// GetDecryptedAPISecret 获取解密后的API Secret（内部使用）
func GetDecryptedAPISecret(provider *models.APIProvider) (string, error) {
	if provider.APISecret == "" {
		return "", nil
	}

	encryptionKey, err := getOrCreateEncryptionKey()
	if err != nil {
		return "", err
	}

	return utils.DecryptData(provider.APISecret, encryptionKey)
}

// getOrCreateEncryptionKey 获取或创建加密密钥
// 实际应用中应从配置文件或密钥管理服务获取
func getOrCreateEncryptionKey() ([]byte, error) {
	// TODO: 从配置或KMS获取密钥
	// 这里使用固定密钥仅供示例，生产环境必须使用安全的密钥管理
	key := []byte("cese-encryption1") // 16字节
	return key, nil
}
