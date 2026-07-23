# DataVault Application

A Node.js web application deployed on Kubernetes using Docker, MariaDB StatefulSet, GitHub Actions CI/CD, and a Self-Hosted Runner.

---

## Project Structure

```text
datavault-app/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── kubernetes/
|   ├── namespace.yml
│   ├── configmap.yml
│   ├── db-service.yml
│   ├── deployment.yml
│   ├── service.yml
│   └── statefulSet.yml
│
├── .gitignore
├── Dockerfile
├── index.html
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

---

# Architecture

```text
Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ▼
Self Hosted Runner
    │
    ├── Build Docker Image
    ├── Push Image to Docker Hub
    └── Deploy to Kubernetes
                │
                ├── Node.js Application
                ├── MariaDB StatefulSet
                └── Services
```

---

# Prerequisites

Install the following software before starting:

* Git
* Docker
* Kubernetes Cluster (using kind cluster)
* kubectl

---

# Clone Repository

Clone the repository:

```bash
git clone https://github.com/Pankajarya1058/datavault-app.git
```

Move into the project directory:

```bash
cd datavault-app
```

---

# Kubernetes Deployment

Create namespace:

```bash
kubectl apply -f kubernetes/namespace.yml
```

---

# Create Secret for Database

Create your own password:

```bash
kubectl create secret generic db-secret -n datavault --from-literal=MYSQL_ROOT_PASSWORD='<Your-password>'
```

## Deploy ConfigMap

```bash
kubectl apply -f kubernetes/configmap.yml
```

Verify:

```bash
kubectl get configmap -n datavault
```

---

## Deploy MariaDB StatefulSet

```bash
kubectl apply -f kubernetes/statefulSet.yml
```

Verify:

```bash
kubectl get statefulset -n datavault
kubectl get pods -n datavault
```

---

## Deploy Database Service

```bash
kubectl apply -f kubernetes/db-service.yml
```

Verify:

```bash
kubectl get svc -n datavault
```

---

## Deploy Application

> [!NOTE]
> The Kubernetes manifests are configured to pull the pre-built Docker image from Docker Hub.
>
> If you want to build the application from source, build a new Docker image, push it to Docker Hub, and update the image name in `kubernetes/deployment.yml` before deploying the application.


```bash
kubectl apply -f kubernetes/deployment.yml
```

Verify:

```bash
kubectl get deployment -n datavault
```

---

## Deploy Application Service

```bash
kubectl apply -f kubernetes/service.yml
```

Verify:

```bash
kubectl get svc -n datavault
```

---

# Verify Resources

```bash
kubectl get all -n datavault
```

Expected Resources:

* Deployment
* Pods
* Services
* StatefulSet
* PVC
* ConfigMap

---

# Verify MariaDB

Connect to database pod:

```bash
kubectl exec -it datavault-db-0 -n datavault -- bash
```

Login:

```bash
mysql -u root -p
```

Check databases:

```sql
SHOW DATABASES;
```

---

# GitHub Actions CI/CD Pipeline

The project uses GitHub Actions with a Self Hosted Runner.

Workflow Location:

```text
.github/workflows/deploy.yml
```

Pipeline Flow:

1. Checkout Source Code
2. Build Docker Image
3. Login to Docker Hub
4. Push Docker Image
5. Update Kubernetes Deployment
6. Restart Deployment
7. Verify Deployment

---

## Configure GitHub Secrets

Before running the CI/CD pipeline, add the following repository secrets:

| Secret Name | Description |
|------------|-------------|
| DOCKER_USERNAME | Docker Hub Username |
| DOCKER_PASSWORD | Docker Hub Password or Access Token |
| DB_PASSWORD     | Database Password   |

### Steps

1. Open GitHub Repository.
2. Navigate to Settings → Secrets and variables → Actions.
3. Click New repository secret.
4. Add the required secrets.
5. Save the secrets.

These secrets are used by GitHub Actions to authenticate with Docker Hub and push container images securely.

---

# Configure Self Hosted Runner

## Step 1

Navigate to:

```text
Repository
→ Settings
→ Actions
→ Runners
→ New Self-hosted Runner
```

---

## Step 2

Create Runner Directory

```bash
mkdir actions-runner
cd actions-runner
```

---

## Step 3

Download Runner Package

Download the latest runner package from GitHub and extract it.

Example:

```bash
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64.tar.gz
```

```bash
tar xzf ./actions-runner-linux-x64.tar.gz
```

---

## Step 4

Configure Runner

```bash
./config.sh --url https://github.com/<github-username>/<repository-name> --token <token>
```

---

## Step 5

Run Runner

```bash
./run.sh
```

---

## Step 6 (Recommended)

Install Runner as Service

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

Check status:

```bash
sudo ./svc.sh status
```

---

# Deploy Through GitHub Actions

After making changes:

```bash
git add .
git commit -m "Updated application"
git push origin main
```

GitHub Actions will automatically:

* Build Docker image
* Push image to Docker Hub
* Deploy latest image to Kubernetes

---

## Access the Application

After deploying the application and services, access the DataVault application using the NodePort service:

```text
http://<kind-node-ip>:30003
```

### Find the Kind Node IP

Run:

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' kind-control-plane
```

Example output:

```text
172.18.0.2
```

Access the application:

```text
http://172.18.0.2:30003
```

### Verify the Service

```bash
kubectl get svc -n datavault
```

Example:

```text
NAME                    TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
datavault-app-service   NodePort   10.96.10.100   <none>        80:30003/TCP   10m
```

In this example, the application is available on NodePort `30003`.

---

# Troubleshooting

Check Pods:

```bash
kubectl get pods -n datavault
```

Describe Pod:

```bash
kubectl describe pod <pod-name> -n datavault
```

View Logs:

```bash
kubectl logs <pod-name> -n datavault
```

Restart Deployment:

```bash
kubectl rollout restart deployment/datavault-app -n datavault
```

Check Rollout Status:

```bash
kubectl rollout status deployment/datavault-app -n datavault
```

---

# Technologies Used

* Node.js
* Express.js
* MariaDB
* Docker
* Kubernetes
* GitHub Actions
* Self Hosted Runner
* Docker Hub

---

# Author

**Pankaj Kumar**

Senior System Engineer | Linux Administrator | DevOps Engineer
