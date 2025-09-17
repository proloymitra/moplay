# Contentful CMS Setup Guide for PlayInMo

## Step 1: Get Your Contentful Credentials

1. **Login to Contentful**
   - Go to [contentful.com](https://contentful.com) and login to your account

2. **Get Your Space ID**
   - Go to Settings → General settings
   - Copy your **Space ID** (it looks like: `abc123def456`)

3. **Generate Access Token**
   - Go to Settings → API keys
   - Click **Add API key** 
   - Give it a name like "PlayInMo Website"
   - Copy the **Content Delivery API - access token** (it looks like: `abc123def456ghi789...`)

## Step 2: Configure Your Website

1. **Update the Configuration File**
   - Open `js/contentful-config.js`
   - Replace `YOUR_SPACE_ID` with your actual Space ID
   - Replace `YOUR_ACCESS_TOKEN` with your actual access token

## Step 3: Create Content Types in Contentful

### Create "Game" Content Type

1. **Go to Content model → Add content type**
2. **Name**: `Game`
3. **API Identifier**: `game`
4. **Add these fields**:

   | Field Name | Field ID | Field Type | Settings |
   |------------|----------|------------|----------|
   | Title | title | Short text | Required |
   | Slug | slug | Short text | Required, Unique |
   | Description | description | Long text | Optional |
   | Thumbnail Image | thumbnailImage | Media | Required |
   | Play URL | playUrl | Short text | Required |
   | Category | category | Reference | Required, Reference to Category |
   | Featured | featured | Boolean | Optional |
   | Difficulty | difficulty | Integer | Optional, Min: 1, Max: 5 |
   | Rating | rating | Integer | Optional, Min: 1, Max: 5 |
   | Play Count | playCount | Integer | Optional, Default: 0 |

### Create "Category" Content Type

1. **Go to Content model → Add content type**
2. **Name**: `Category`
3. **API Identifier**: `category`
4. **Add these fields**:

   | Field Name | Field ID | Field Type | Settings |
   |------------|----------|------------|----------|
   | Name | name | Short text | Required |
   | Slug | slug | Short text | Required, Unique |
   | Description | description | Long text | Optional |
   | Icon | icon | Short text | Optional (Font Awesome class) |
   | Background Gradient | backgroundGradient | Short text | Optional |
   | Game Count | gameCount | Integer | Optional, Default: 0 |

### Create "Site Content" Content Type (Optional)

1. **Go to Content model → Add content type**
2. **Name**: `Site Content`
3. **API Identifier**: `siteContent`
4. **Add these fields**:

   | Field Name | Field ID | Field Type | Settings |
   |------------|----------|------------|----------|
   | Page | page | Short text | Required |
   | Section | section | Short text | Optional |
   | Title | title | Short text | Required |
   | Content | content | Rich text | Required |

## Step 4: Add Sample Content

### Add Categories
1. **Action Games**
   - Name: `Action Games`
   - Slug: `action`
   - Icon: `fas fa-fist-raised`
   - Background Gradient: `linear-gradient(45deg, #ff6b6b, #ee5a24)`

2. **Puzzle Games**
   - Name: `Puzzle Games`
   - Slug: `puzzle`
   - Icon: `fas fa-puzzle-piece`
   - Background Gradient: `linear-gradient(45deg, #4834d4, #686de0)`

3. **Sports Games**
   - Name: `Sports Games`
   - Slug: `sports`
   - Icon: `fas fa-football-ball`
   - Background Gradient: `linear-gradient(45deg, #00d2d3, #54a0ff)`

### Add Sample Games
Add a few games with:
- Interesting titles
- Good descriptions
- Placeholder images
- Links to online games or placeholder URLs
- Assign to categories
- Set difficulty and rating

## Step 5: Update Your HTML Pages

Add these script tags to your HTML pages that need dynamic content:

```html
<!-- Add before closing </body> tag -->
<script src="js/contentful-config.js"></script>
<script src="js/game-loader.js"></script>
```

## Step 6: Add Container Elements

Add these elements to your HTML where you want dynamic content:

```html
<!-- For displaying games -->
<div id="games-container"></div>

<!-- For displaying categories -->
<div id="categories-container"></div>

<!-- For search functionality (optional) -->
<input type="text" id="game-search" placeholder="Search games...">
```

## Step 7: Test Your Setup

1. **Open your website**
2. **Check browser console** for any errors
3. **Verify games and categories load**
4. **Test search functionality**

## Example Integration for Index Page

```html
<!-- Add to your main games section -->
<section class="section">
    <div class="container">
        <h2 class="title is-2 has-text-centered">Featured Games</h2>
        <div id="games-container">
            <!-- Games will be loaded here -->
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <h2 class="title is-2 has-text-centered">Game Categories</h2>
        <div id="categories-container">
            <!-- Categories will be loaded here -->
        </div>
    </div>
</section>

<!-- Add before closing body tag -->
<script src="js/contentful-config.js"></script>
<script src="js/game-loader.js"></script>
```

## Troubleshooting

### Games not loading?
- Check your Space ID and Access Token are correct
- Verify content types are published
- Check browser console for API errors

### Images not displaying?
- Make sure thumbnail images are uploaded to Contentful
- Check that images are published

### Search not working?
- Ensure you have an input element with `id="game-search"`
- Verify games have titles and descriptions

## Next Steps

Once everything is working:
1. **Add more games and categories**
2. **Customize the game card design**
3. **Add game filtering options**
4. **Implement user favorites**
5. **Add game ratings and reviews**

Your PlayInMo website is now powered by Contentful CMS! You can manage all your games and content through the Contentful web interface.