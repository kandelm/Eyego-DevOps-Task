# Eyego DevOps Task

## 🌐 Live URL
http://a12025bb4b0f244f98cb115e17ee3ad8-2075449565.us-east-1.elb.amazonaws.com/api

## 🚀 CI/CD Flow
1. Push to GitHub triggers pipeline.
2. Image is built and pushed to ECR.
3. Kubernetes Deployment is updated via `kubectl`.

## 🔄 Migration Strategy
To migrate to:
- **GCB**: Use Google Container Registry + GKE, replace EKS CLI with `gcloud container clusters`.
- **Alibaba Cloud**: Push to ACR, deploy using Alibaba ACK and `aliyun` CLI.

## 📁 Project Structure
