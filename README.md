
# Eyego DevOps Task

This project sets up a simple Node.js app, containerizes it with Docker, deploys it to AWS EKS with two replicas, and automates the process using GitHub Actions. The app responds with "Hello Eyego" at the root endpoint (`/`). The setup is designed to be easy to move to Google Cloud or Alibaba Cloud.

## Live URL
http://a12025bb4b0f244f98cb115e17ee3ad8-2075449565.us-east-1.elb.amazonaws.com/
(you can get this from `kubectl get svc eyego-service`)

## Tech Used
- Node.js with Express
- Docker (containerization)
- AWS ECR (elastic container repository : image storage in AWS)
- AWS EKS (Kubernetes cluster)
- GitHub Actions (CI/CD)
- kubectl and eksctl

## Project Files
- `app.js`: Node.js app code
- `package.json`: App dependencies
- `Dockerfile`: Docker setup
- `k8s/deployment.yaml`: Kubernetes deployment (2 replicas)
- `k8s/service.yaml`: LoadBalancer service
- `.github/workflows/deploy.yml`: CI/CD pipeline
- `README.md`: This file 

## How to Set It Up

### 1. Build the App
- **server.js**:
  ```javascript
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  app.get('/', (req, res) => {  
    res.json({ message: 'Hello Eyego' });
  });
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  ```

- **package.json**:
  ```json
  {
    "name": "hello-eyego-app",
    "version": "1.0.0",
    "description": "Simple Node.js app for AWS Kubernetes deployment",
    "main": "src/server.js",
    "scripts": {
      "start": "node src/server.js"
    },
    "dependencies": {
      "express": "^4.17.1"
    }
  }
  ```

### 2. Dockerize the app
- **Dockerfile**:
  ```dockerfile
  FROM node:16-slim
  WORKDIR /app
  COPY package.json .
  RUN npm install
  COPY src/ ./src
  EXPOSE 3000
  CMD ["npm", "start"]    
  ```

- Build the app locally and test if respond or not:
  ```bash
  docker build -t eyego-app .
  docker run -p 3000:3000 eyego-app
  ```

### 3. Push to AWS ECR
- Create ECR repository:
  ```bash
  aws ecr create-repository --repository-name eyego-app --region us-east-1
  ```
- Log in to ECR:
  ```bash
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 162717643593.dkr.ecr.us-east-1.amazonaws.com
  ```
- Tag and push:
  ```bash
  docker tag eyego-app:latest 162717643593.dkr.ecr.us-east-1.amazonaws.com/eyego-app:latest
  docker push 162717643593.dkr.ecr.us-east-1.amazonaws.com/eyego-app:latest
  ```

### 4. Set Up EKS Cluster

- Install `eksctl` in Windows 

- Create cluster from the local terminal:
  ```bash
  eksctl create cluster --name eyego-cluster --region us-east-1 --nodes 2 --node-type t2.micro
  ```
- Update kubectl:
  ```bash
  aws eks update-kubeconfig --region us-east-1 --name eyego-cluster
  ```

### 5. Deploy to Kubernetes

- **k8s/deployment.yaml**:
  ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: eyego-deployment
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: eyego
      template:
        metadata:
          labels:
            app: eyego
        spec:
          containers:
          - name: eyego
            image: 162717643593.dkr.ecr.us-east-1.amazonaws.com/eyego-app:latest
            ports:
            - containerPort: 3000
  ```

- **k8s/service.yaml**:
```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: eyego-service
    spec:
      type: LoadBalancer
      selector:
        app: eyego
      ports:
      - protocol: TCP
        port: 80
        targetPort: 3000
```

- Deploy:
  ```bash
  kubectl apply -f k8s/deployment.yaml
  kubectl apply -f k8s/service.yaml
  ```

- Get the URL:
  ```bash
  kubectl get svc eyego-service
  ```
  Test: `curl http://a12025bb4b0f244f98cb115e17ee3ad8-2075449565.us-east-1.elb.amazonaws.com/` 
(should return "Hello Eyego").

### 6. Automate The Deployment with GitHub Actions
- **.github/workflows/deploy.yml**:
  ```yaml
  name: Deploy to AWS EKS

  on:
    push:
      branches: [ "main" ]

  jobs:
    deploy:
      runs-on: ubuntu-latest

      steps:
      - name: Checkout source
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        run: |
          IMAGE_URI=162717643593.dkr.ecr.us-east-1.amazonaws.com/eyego-app:latest
          docker build -t $IMAGE_URI .
          docker push $IMAGE_URI

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region us-east-1 --name eyego-cluster

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
  ```

- Add GitHub secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

- Push to `main` branch to trigger the pipeline.

### 7. Moving to Other Clouds
- **Google Cloud (GKE)**:

  - Create GKE cluster: 
    ```bash
    gcloud container clusters create eyego-cluster --machine-type e2-micro --num-nodes 2
    ```
  - Configure kubectl: 
    ```bash
    gcloud container clusters get-credentials eyego-cluster --zone us-central1-a
    ```
  - Push to GCR: 
    ```bash
    docker build -t gcr.io/<project-id>/eyego-app .
    docker push gcr.io/<project-id>/eyego-app
    ```
  - Update `deployment.yaml` with GCR image:
    ```yaml
    image: gcr.io/<project-id>/eyego-app
    ```
  - Apply manifests: 
    ```bash
    kubectl apply -f k8s/
    ```
