# Cloud-Kit

Cloud-kit is a deployment platform built with TypeScript, Node.js, Redis, and AWS S3. This project demonstrates a complete CI/CD pipeline for deploying React applications with automatic builds and hosting.

## 🎯 Overview

This platform enables users to deploy React applications directly from GitHub repositories, similar to Vercel. The system automatically clones repositories, builds projects, and serves them through a custom domain infrastructure.

## 🏗️ Architecture

The project follows a microservices architecture with three primary services:

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       │ GitHub URL
       ▼
┌─────────────────┐
│ Upload Service  │ ──► Clone Repo ──► Upload to S3 ──► Push to Redis Queue
└─────────────────┘
       │
       │ deployment-id
       ▼
┌──────────────────┐
│ Deploy Service   │ ──► Pull from Queue ──► Build Project ──► Upload Build to S3
└──────────────────┘
       │
       │ Build artifacts
       ▼
┌──────────────────┐
│ Request Handler  │ ──► Serve from S3 ──► Deliver to Browser
└──────────────────┘
```

## 📦 Services

### 1. Upload Service (vercel-upload-service)
- **Purpose**: Handles GitHub repository ingestion
- **Responsibilities**:
  - Receives GitHub repository URLs from the frontend
  - Clones the repository to a temporary directory
  - Uploads the project files to AWS S3
  - Generates a unique deployment ID
  - Pushes the deployment job to Redis Queue for processing
  - Tracks upload status

### 2. Deploy Service (vercel-deploy-service)
- **Purpose**: Builds and deploys projects
- **Responsibilities**:
  - Monitors Redis Queue for new deployment jobs
  - Retrieves project files from S3
  - Runs concurrent workers to build React projects
  - Executes `npm install` and `npm run build`
  - Uploads built artifacts (HTML, CSS, JS) back to S3
  - Updates deployment status in Redis

### 3. Request Handler Service (vercel-request-handler)
- **Purpose**: Serves deployed applications
- **Responsibilities**:
  - Processes incoming HTTP requests
  - Extracts subdomain from request URL
  - Fetches corresponding built files from S3
  - Serves static files to the browser
  - Handles routing for deployed applications

### 4. Frontend
- **Purpose**: User interface for deployment management
- **Technology**: React + TypeScript (Vite)
- **Features**:
  - GitHub repository URL input
  - Deployment initiation
  - Real-time deployment status tracking
  - Deployment link generation
  - Responsive UI

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Queue**: Redis (for job management)
- **Storage**: AWS S3 (for file storage) and Cloudflare
- **Additional**: 
  - Express.js (API framework)
  - Bull/BullMQ (Redis queue wrapper)

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS 

### Infrastructure
- AWS S3 for object storage
- Redis for message queuing
- Potential deployment on AWS EC2/ECS


## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Redis server
- AWS Account with S3 access
- AWS CLI configured

### Environment Variables

Create a `.env` file in each service directory:

```env
# AWS Configuration
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=your-region

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Service Configuration
PORT=3000
BACKEND_UPLOAD_URL=http://localhost:3000
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hkirat/vercel.git
cd vercel
```

2. **Install dependencies for each service**
```bash
# Upload Service
cd vercel-upload-service
npm install

# Deploy Service
cd ../vercel-deploy-service
npm install

# Request Handler
cd ../vercel-request-handler
npm install

# Frontend
cd ../frontend
npm install
```

3. **Build TypeScript services**
```bash
# In each service directory
npm run build
# or
npx tsc -b
```

### Running the Services

Start each service in separate terminal windows:

```bash
# Terminal 1 - Upload Service
cd vercel-upload-service
node dist/index.js

# Terminal 2 - Deploy Service
cd vercel-deploy-service
node dist/index.js

# Terminal 3 - Request Handler
cd vercel-request-handler
node dist/index.js

# Terminal 4 - Frontend
cd frontend
npm run dev
```

### Configure Local Hosts

For local development, add entries to `/etc/hosts`:

```bash
sudo nano /etc/hosts

# Add entries like:
127.0.0.1   <deployment-id>.localhost
```

### Usage

1. Open the frontend at `http://localhost:5173`
2. Enter a GitHub repository URL (must be a React project)
3. Click "Upload" to start deployment
4. Wait for the build process to complete
5. Access your deployed site at the provided subdomain

## 🔧 Development

### Project Structure

```
vercel/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── vercel-upload-service/   # Upload service
│   ├── src/
│   │   ├── aws.ts          # S3 operations
│   │   ├── index.ts        # Main server
│   │   └── utils.ts
│   ├── tsconfig.json
│   └── package.json
│
├── vercel-deploy-service/   # Build & deploy service
│   ├── src/
│   │   ├── aws.ts          # S3 operations
│   │   ├── index.ts        # Queue consumer & builder
│   │   └── utils.ts
│   ├── tsconfig.json
│   └── package.json
│
└── vercel-request-handler/  # Request handling service
    ├── src/
    │   ├── aws.ts          # S3 retrieval
    │   ├── index.ts        # HTTP server
    │   └── utils.ts
    ├── tsconfig.json
    └── package.json
```

### Building

Each service uses TypeScript and requires compilation:

```bash
npx tsc -b
```

## 🌐 Deployment Workflow

1. **User submits GitHub URL** → Frontend sends request to Upload Service
2. **Upload Service** → Clones repo, uploads to S3, queues deployment job
3. **Deploy Service** → Picks job from queue, builds project, uploads artifacts
4. **Request Handler** → Serves built files from S3 to end users

## 🔐 AWS Configuration

### S3 Bucket Setup

1. Create an S3 bucket for storing projects
2. Configure CORS policy:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

3. Set appropriate IAM permissions for S3 access

### IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

## 🚧 Scaling Considerations

For production deployment, consider:

### Containerization
- **Docker**: Containerize each service
- **Kubernetes**: Orchestrate with K8s for auto-scaling
- **AWS ECS/EKS**: Deploy on managed container services

### Queue Management
- Replace Redis with **AWS SQS** for managed queuing
- Use **AWS Lambda** for serverless deployment workers
- Implement **AWS Fargate** for auto-scaling based on queue size

### Global Distribution
- **CloudFront**: CDN for faster content delivery
- **AWS Global Accelerator**: Optimize routing
- **Multi-region S3**: Deploy across regions for redundancy

### Monitoring & Logging
- **CloudWatch**: Monitor service health and logs
- **X-Ray**: Distributed tracing
- **Prometheus + Grafana**: Custom metrics dashboard

## 🔍 Testing

Test the deployment locally:

```bash
# Using curl to check deployed site
curl -H "Host: <deployment-id>.localhost:3001" http://localhost:3001
```

## 📝 Troubleshooting

### Common Issues

**Build Fails**
- Ensure `package.json` has proper build script
- Check Node.js version compatibility
- Verify all dependencies are installed

**Cannot Access Deployed Site**
- Update `/etc/hosts` file
- Use HTTPS or configure proper DNS
- Check S3 bucket permissions

**Redis Connection Issues**
- Verify Redis server is running
- Check Redis connection credentials
- Ensure firewall allows Redis port

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Built as an educational project inspired by Vercel's architecture
- Community contributions and feedback

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

## ⭐ Show Your Support

If you found this project helpful, please give it a star!
