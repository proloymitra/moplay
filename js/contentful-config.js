// Contentful Configuration
const CONTENTFUL_CONFIG = {
    space: 'lkbp1cph23t0', // Your Space ID
    accessToken: 'tsUcSA4jw7UAFtjfuLmUk6PJvmaJAjnG5S3RY7j_5HE', // Content Delivery API access token
    host: 'cdn.contentful.com'
};

class ContentfulService {
    constructor() {
        this.baseUrl = `https://${CONTENTFUL_CONFIG.host}/spaces/${CONTENTFUL_CONFIG.space}/entries`;
    }

    async fetch(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseUrl);
        url.searchParams.append('access_token', CONTENTFUL_CONFIG.accessToken);
        
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Contentful API Error:', error);
            return null;
        }
    }

    // Get all games
    async getGames(limit = 100, featured = null) {
        const params = {
            content_type: 'game',
            limit: limit,
            order: '-sys.createdAt'
        };

        if (featured !== null) {
            params['fields.featured'] = featured;
        }

        return await this.fetch('', params);
    }

    // Get games by category
    async getGamesByCategory(categoryId, limit = 50) {
        const params = {
            content_type: 'game',
            'fields.category.sys.id': categoryId,
            limit: limit
        };

        return await this.fetch('', params);
    }

    // Get all categories
    async getCategories() {
        const params = {
            content_type: 'category',
            order: 'fields.name'
        };

        return await this.fetch('', params);
    }

    // Get single game by slug
    async getGameBySlug(slug) {
        const params = {
            content_type: 'game',
            'fields.slug': slug,
            limit: 1
        };

        return await this.fetch('', params);
    }

    // Get site content
    async getSiteContent(page, section = null) {
        const params = {
            content_type: 'siteContent',
            'fields.page': page
        };

        if (section) {
            params['fields.section'] = section;
        }

        return await this.fetch('', params);
    }

    // Search games
    async searchGames(query, limit = 20) {
        const params = {
            content_type: 'game',
            'fields.title[match]': query,
            limit: limit
        };

        return await this.fetch('', params);
    }

    // Get asset URL
    getAssetUrl(asset, width = null, height = null) {
        if (!asset || !asset.fields || !asset.fields.file) {
            return '';
        }

        let url = `https:${asset.fields.file.url}`;
        
        if (width || height) {
            const params = new URLSearchParams();
            if (width) params.append('w', width);
            if (height) params.append('h', height);
            params.append('fit', 'fill');
            url += `?${params.toString()}`;
        }

        return url;
    }

    // Process entries to include linked assets
    processEntries(data) {
        if (!data || !data.items) return [];

        const assets = {};
        const entries = {};

        // Index assets and entries
        if (data.includes) {
            if (data.includes.Asset) {
                data.includes.Asset.forEach(asset => {
                    assets[asset.sys.id] = asset;
                });
            }
            if (data.includes.Entry) {
                data.includes.Entry.forEach(entry => {
                    entries[entry.sys.id] = entry;
                });
            }
        }

        // Process items and resolve references
        return data.items.map(item => {
            const processed = { ...item };

            // Resolve asset references
            Object.keys(item.fields).forEach(key => {
                const field = item.fields[key];
                
                if (field && field.sys && field.sys.type === 'Link') {
                    if (field.sys.linkType === 'Asset' && assets[field.sys.id]) {
                        processed.fields[key] = assets[field.sys.id];
                    } else if (field.sys.linkType === 'Entry' && entries[field.sys.id]) {
                        processed.fields[key] = entries[field.sys.id];
                    }
                }
            });

            return processed;
        });
    }
}

// Global instance
window.contentfulService = new ContentfulService();