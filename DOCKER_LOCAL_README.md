# Local Docker Development Setup

This guide explains how to use the `docker-compose.local.yml` file for local development with MongoDB.

## Prerequisites

- Docker and Docker Compose installed
- MongoDB Compass (for database debugging)

## Quick Start

1. **Start the local development environment:**
   ```bash
   docker-compose -f docker-compose.local.yml up --build
   ```

2. **Access your services:**
   - **Application**: http://localhost:5000
   - **MongoDB**: localhost:27017 (use MongoDB Compass to connect)

3. **Stop the environment:**
   ```bash
   docker-compose -f docker-compose.local.yml down
   ```

## Environment Variables

The local setup uses these default environment variables:

- `NODE_ENV=production` (to serve the React frontend)
- `MONGO_URI=mongodb://admin:password123@mongodb:27017/b2b-ecommerce?authSource=admin`

## Services

### MongoDB
- **Container**: `b2b-mongo`
- **Port**: 27017
- **Credentials**: admin/password123
- **Database**: b2b-ecommerce
- **Data Persistence**: Local volume `mongodb_data`

### Application
- **Container**: `b2b-app`
- **Port**: 5000
- **Environment**: Production (serves React frontend)
- **Uploads**: Mounted from `./uploads` directory

## File Structure

```
mymerch/
├── docker-compose.local.yml    # Local development setup with MongoDB
├── docker-compose.yml          # Production setup
├── uploads/                    # Local uploads directory (mounted)
└── ...
```

## Development Workflow

### 1. First Time Setup
```bash
# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start services with build
docker-compose -f docker-compose.local.yml up --build
```

### 2. Regular Development
```bash
# Start services
docker-compose -f docker-compose.local.yml up

# Stop services
docker-compose -f docker-compose.local.yml down
```

### 3. Rebuild After Changes
```bash
# Rebuild when package.json or code changes
docker-compose -f docker-compose.local.yml up --build

# Force rebuild from scratch
docker-compose -f docker-compose.local.yml build --no-cache
```

## Database Management

### Using MongoDB Compass (Recommended)
1. **Open MongoDB Compass**
2. **Connect to**: `mongodb://admin:password123@localhost:27017`
3. **Browse databases, collections, and documents visually**

### Using MongoDB shell
```bash
# Access MongoDB shell
docker exec -it b2b-mongo mongosh -u admin -p password123

# Connect to database
use b2b-ecommerce

# View collections
show collections

# Query examples
db.products.find()
db.users.find()
```

### Database Operations
```bash
# Reset database (removes all data)
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up --build

# View database logs
docker logs b2b-mongo
```

## Useful Development Commands

### Service Management
```bash
# View running containers
docker ps

# View logs
docker-compose -f docker-compose.local.yml logs app
docker-compose -f docker-compose.local.yml logs mongodb

# Restart application
docker-compose -f docker-compose.local.yml restart app

# Shell into application container
docker exec -it b2b-app bash
```

### Development Testing
```bash
# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products

# Test database connection from application
docker exec b2b-app node -e "console.log(process.env.MONGO_URI)"
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: 
   - Ports 5000 and 27017 must be available
   - Modify ports in `docker-compose.local.yml` if needed

2. **Permission issues**: 
   ```bash
   chmod -R 755 uploads
   sudo chown -R $USER:$USER uploads
   ```

3. **MongoDB connection issues**:
   ```bash
   # Check if MongoDB is running
   docker-compose -f docker-compose.local.yml ps
   
   # View MongoDB logs
   docker-compose -f docker-compose.local.yml logs mongodb
   ```

4. **Build issues**:
   ```bash
   # Clean rebuild
   docker-compose -f docker-compose.local.yml down
   docker system prune -f
   docker-compose -f docker-compose.local.yml build --no-cache
   ```

5. **MongoDB Compass connection issues**:
   - Ensure MongoDB container is running
   - Use connection string: `mongodb://admin:password123@localhost:27017`
   - Check firewall/antivirus isn't blocking port 27017

## Differences from Production

| Feature | Local Development | Production |
|---------|-------------------|------------|
| **MongoDB** | Local container | External (Atlas/Cloud) |
| **Environment** | Production (with local DB) | Production |
| **File Uploads** | Local directory `./uploads` | Named volume |
| **Database** | `b2b-ecommerce` | `b2b-ecommerce` |
| **Ports** | 5000, 27017 | 5000 only |
| **Database Access** | MongoDB Compass | Production tools |

## MongoDB Compass Connection

To connect MongoDB Compass to your local database:

1. **Connection String**: `mongodb://admin:password123@localhost:27017`
2. **Authentication Database**: `admin`
3. **Database**: `b2b-ecommerce`

## Next Steps

After setting up the local environment:

1. **Connect MongoDB Compass**: Use the connection details above
2. **Seed the database**: Run seeding scripts if available
3. **Test key features**: Create products, users, orders
4. **Monitor application**: Check logs for any issues 