# moplay - H5 Gaming Website

A comprehensive HTML5 gaming platform with WordPress backend, featuring user management, achievements, leaderboards, and ad integration.

## Features

### Frontend
- **Responsive Design**: Modern, mobile-first design with dark gaming theme
- **Game Player**: HTML5 game player with fullscreen support
- **Pre/Post-roll Ads**: Advertisement system for monetization
- **User System**: Registration, login, and profile management
- **Real-time Chat**: Global chat system for community interaction
- **Leaderboards**: Competitive ranking system with filtering
- **Achievements**: Gamification with badges and rewards
- **Search & Categories**: Game discovery and organization

### Backend (WordPress)
- **Custom Post Types**: Games and achievements management
- **Game CMS**: Upload games via URL or file upload
- **User Data Tracking**: Game plays, scores, and progress
- **REST API**: RESTful endpoints for frontend integration
- **Admin Dashboard**: WordPress admin for content management

### SEO & AdSense Ready
- **SEO Optimized**: Meta tags, structured data, and clean URLs
- **AdSense Compliant**: Privacy policy, terms of service, and proper ad placement
- **Performance**: Optimized loading and caching
- **Analytics Ready**: Google Analytics integration support

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: WordPress, PHP, MySQL
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Installation

### Prerequisites
- Local server environment (XAMPP, WAMP, or similar)
- WordPress installation
- Modern web browser

### Setup Instructions

1. **Clone/Download the project**
   ```bash
   git clone <repository-url>
   cd moplay
   ```

2. **Setup WordPress**
   - Install WordPress in the `wordpress` directory
   - Copy `wordpress/functions.php` to your active theme
   - Activate the custom post types and features

3. **Frontend Setup**
   - Upload frontend files to your web server
   - Ensure proper file permissions
   - Update API endpoints in JavaScript files

4. **Database Configuration**
   - Import database schema (automatically created by WordPress functions)
   - Configure database connection in WordPress

5. **Domain Configuration**
   - Update all references to `moplay.com` with your domain
   - Configure WordPress site URL and home URL

## File Structure

```
moplay/
├── index.html              # Homepage
├── game-player.html        # Game player page
├── leaderboard.html        # Leaderboard page
├── achievements.html       # Achievements page
├── privacy-policy.html     # Privacy policy (required for AdSense)
├── terms-of-service.html   # Terms of service
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine directives
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   └── js/
│       ├── main.js        # Homepage functionality
│       ├── game-player.js # Game player functionality
│       ├── leaderboard.js # Leaderboard functionality
│       └── achievements.js # Achievements system
├── wordpress/
│   └── functions.php      # WordPress custom functions
└── README.md              # This file
```

## Key Features Implementation

### Game Management
- Upload games via external URL or file upload
- Automatic thumbnail generation
- Category and tag organization
- Rating and play count tracking

### User Engagement
- Achievement system with points and badges
- Leaderboard with multiple ranking criteria
- Real-time chat system
- Social features (friends, ratings, comments)

### Monetization
- Pre-roll and post-roll advertisement slots
- AdSense-ready structure and policies
- Clean, ad-friendly design
- User engagement metrics

### SEO Optimization
- Semantic HTML structure
- Meta tags and Open Graph
- XML sitemap
- Clean URL structure
- Fast loading times
- Mobile optimization

## WordPress Integration

### Custom Post Types
- **Games**: Main game content type
- **Achievements**: Achievement definitions
- **Categories**: Game categorization
- **Tags**: Game tagging system

### REST API Endpoints
- `GET /wp-json/moplay/v1/games` - Get games list
- `GET /wp-json/moplay/v1/games/{id}` - Get single game
- `POST /wp-json/moplay/v1/game-plays` - Record game play
- `GET /wp-json/moplay/v1/leaderboard` - Get leaderboard
- `GET /wp-json/moplay/v1/achievements` - Get achievements
- `GET /wp-json/moplay/v1/chat` - Get chat messages
- `POST /wp-json/moplay/v1/chat` - Send chat message

### Database Tables
- `moplay_game_plays` - User game play records
- `moplay_user_achievements` - User achievement unlocks
- `moplay_chat_messages` - Chat message history

## AdSense Requirements Checklist

- ✅ Privacy Policy page
- ✅ Terms of Service page
- ✅ Contact information
- ✅ Original, high-quality content
- ✅ User-friendly navigation
- ✅ Mobile-responsive design
- ✅ Fast loading times
- ✅ Proper ad placement areas
- ✅ Clean, professional design
- ✅ Regular content updates (via games)

## GitHub Pages Deployment

1. **Prepare for deployment**
   ```bash
   # Remove server-side dependencies for static hosting
   # Update API calls to use external WordPress installation
   ```

2. **GitHub Setup**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/moplay.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository settings
   - Enable GitHub Pages from main branch
   - Configure custom domain (moplay.com)

4. **Domain Configuration**
   - Add CNAME file with your domain
   - Configure DNS settings at your domain provider
   - Enable HTTPS in GitHub Pages settings

## Domain Setup

### DNS Configuration
```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     yourusername.github.io
```

### Custom Domain File
Create a `CNAME` file in the root directory:
```
moplay.com
```

## Development

### Local Development
1. Use a local server (Live Server extension for VS Code)
2. Update API endpoints to point to your WordPress installation
3. Test all functionality thoroughly

### Production Deployment
1. Minimize and optimize CSS/JS files
2. Optimize images and assets
3. Configure proper caching headers
4. Set up monitoring and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Email: support@moplay.com
- GitHub Issues: Create an issue in this repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### Version 1.0.0 (2024-12-19)
- Initial release
- Complete frontend implementation
- WordPress backend integration
- Achievement system
- Leaderboard functionality
- Chat system
- SEO optimization
- AdSense preparation