# 🔐 **GitHub Secrets Configuration Guide**

## **🚀 WHAT TO DO RIGHT NOW (Haven't deployed yet?)**

**Step 1: Set up Docker Hub secrets first** ⭐
1. Create Docker Hub account at https://hub.docker.com
2. Generate access token (Account Settings → Security → New Access Token)
3. Add these GitHub secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token

**Step 2: Handle the API URL**
- **Option A**: Add `REACT_APP_API_URL` with placeholder: `https://placeholder-backend-url.onrender.com/api`
- **Option B**: Skip this secret for now, add it after deployment

**Step 3: Push to GitHub**
- Commit and push your code to main branch
- This triggers GitHub Actions to build Docker images
- Images get pushed to Docker Hub automatically

**Step 4: Then deploy to Render**
- Deploy backend first, get the URL
- Update `REACT_APP_API_URL` secret with real URL
- Deploy frontend

---

## **Step-by-Step GitHub Secrets Setup**

### **1. Access GitHub Secrets**

1. **Navigate to your GitHub repository**
   ```
   https://github.com/yourusername/personal-finance-tracker
   ```

2. **Go to Repository Settings**
   - Click on **Settings** tab (top navigation)
   - Scroll down to **Security** section in left sidebar
   - Click on **Secrets and variables**
   - Select **Actions**

### **2. Required Secrets for CI/CD Pipeline**

Click **"New repository secret"** for each of the following:

#### **🐳 Docker Hub Secrets**

**Secret Name:** `DOCKER_USERNAME`
**Value:** Your Docker Hub username
```
Example: johndoe
```

**Secret Name:** `DOCKER_PASSWORD`
**Value:** Your Docker Hub access token (NOT your password)
```
How to get it:
1. Go to hub.docker.com
2. Login → Account Settings
3. Security tab → New Access Token
4. Copy the generated token
```

#### **🌐 API Configuration Secrets**

**Secret Name:** `REACT_APP_API_URL`
**Value:** Your backend API URL on Render
```
⚠️ IMPORTANT: If you haven't deployed to Render yet:
- Option 1: Use placeholder: https://placeholder-backend-url.onrender.com/api
- Option 2: Skip this secret for now, add it after backend deployment

After backend deployment:
Example: https://finance-tracker-backend-xyz.onrender.com/api
Note: You'll get this URL after deploying backend to Render
```

#### **🚀 Render Deployment (Optional)**

**Secret Name:** `RENDER_DEPLOY_WEBHOOK`
**Value:** Render deploy hook URL
```
How to get it:
1. Go to Render dashboard
2. Select your service
3. Settings → Deploy Hook
4. Copy the webhook URL
```

### **3. Environment Variables for Production**

These will be configured directly in Render, not as GitHub secrets:

#### **Backend Environment Variables (Render)**
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secure random string (32+ characters)
- `NODE_ENV`: `production`
- `PORT`: `5000`

#### **AI API Keys (Optional)**
- `REACT_APP_GEMINI_API_KEY`: Your Google Gemini API key
- `REACT_APP_HUGGING_FACE_TOKEN`: Your Hugging Face token
- `REACT_APP_COHERE_TOKEN`: Your Cohere API token

## **📋 Complete Setup Checklist**

### **✅ Phase 1: Docker Hub Setup**
- [ ] Create Docker Hub account
- [ ] Generate access token
- [ ] Create repositories:
  - [ ] `finance-tracker-backend`
  - [ ] `finance-tracker-frontend`

### **✅ Phase 2: GitHub Secrets (Start Here)**
- [ ] `DOCKER_USERNAME` ← Your Docker Hub username
- [ ] `DOCKER_PASSWORD` ← Docker Hub access token
- [ ] `REACT_APP_API_URL` ← Use placeholder OR skip for now

### **✅ Phase 3: Build & Push Docker Images**
- [ ] Push code to GitHub main branch
- [ ] GitHub Actions builds Docker images
- [ ] Images pushed to Docker Hub automatically

### **✅ Phase 4: Deploy Backend First**
- [ ] Deploy backend service to Render
- [ ] Note the backend URL
- [ ] Update `REACT_APP_API_URL` secret with real URL

### **✅ Phase 5: Deploy Frontend**
- [ ] Deploy frontend service to Render
- [ ] Test the complete application

## **🔍 How to Verify Secrets**

### **Check if Secrets are Set:**
1. Go to repository Settings → Secrets and variables → Actions
2. You should see:
   - `DOCKER_PASSWORD` (hidden value)
   - `DOCKER_USERNAME` (hidden value)
   - `REACT_APP_API_URL` (hidden value)

### **Test the Pipeline:**
1. Make a small change to README.md
2. Commit and push to main branch
3. Go to **Actions** tab
4. Watch the workflow run
5. Check for any errors in the logs

## **🛠️ Detailed Configuration Steps**

### **Step 1: Docker Hub Access Token**

1. **Login to Docker Hub**
   ```
   https://hub.docker.com/
   ```

2. **Navigate to Security Settings**
   - Click your profile → Account Settings
   - Go to Security tab
   - Click "New Access Token"

3. **Create Token**
   - Access Token Description: `GitHub Actions CI/CD`
   - Access permissions: `Read, Write, Delete`
   - Click "Generate"

4. **Copy Token Immediately**
   - ⚠️ **Important:** Copy the token now - you won't see it again!
   - Save it temporarily in a secure location

### **Step 2: GitHub Repository Secrets**

1. **Add DOCKER_USERNAME**
   ```
   Name: DOCKER_USERNAME
   Value: your-dockerhub-username
   ```

2. **Add DOCKER_PASSWORD**
   ```
   Name: DOCKER_PASSWORD
   Value: dckr_pat_xxxxxxxxxxxxxxxxxxxxx
   ```
   (This is the access token from Step 1)

3. **Add REACT_APP_API_URL (Initially)**
   ```
   Name: REACT_APP_API_URL
   Value: https://placeholder-backend-url.onrender.com/api
   ```
   (Update this after deploying backend)

### **Step 3: MongoDB Atlas Setup**

1. **Create Account**
   ```
   https://www.mongodb.com/atlas
   ```

2. **Create Cluster**
   - Choose M0 (Free tier)
   - Select region closest to you
   - Create cluster

3. **Setup Database Access**
   - Database Access → Add New Database User
   - Username: `admin`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

4. **Setup Network Access**
   - Network Access → Add IP Address
   - Add: `0.0.0.0/0` (Allow access from anywhere)
   - Comment: `Render deployment access`

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Format: `mongodb+srv://admin:password@cluster.mongodb.net/financetracker?retryWrites=true&w=majority`

### **Step 4: Test Local Development**

Before deploying, test your setup locally:

```bash
# 1. Clone repository
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker

# 2. Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Test with Docker Compose
docker-compose up -d

# 4. Check if everything works
curl http://localhost:5000/api/health
curl http://localhost
```

## **⚠️ Security Best Practices**

### **✅ Do's:**
- Use access tokens, not passwords
- Use descriptive secret names
- Set up MongoDB network restrictions properly
- Use strong JWT secrets (32+ characters)
- Regularly rotate access tokens

### **❌ Don'ts:**
- Never commit secrets to code
- Don't use weak passwords
- Don't share access tokens
- Don't use production credentials in development

## **🚨 Troubleshooting**

### **Common Issues:**

1. **GitHub Actions Failing - Docker Login**
   ```
   Error: Error response from daemon: login attempt failed
   ```
   **Solution:** Check DOCKER_USERNAME and DOCKER_PASSWORD secrets

2. **Frontend Can't Connect to Backend**
   ```
   Network Error: ERR_CONNECTION_REFUSED
   ```
   **Solution:** Update REACT_APP_API_URL with correct backend URL

3. **Database Connection Failed**
   ```
   MongoNetworkError: failed to connect to server
   ```
   **Solution:** Check MongoDB URI and network access settings

### **Debug Commands:**

```bash
# Check Docker Hub login
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

# Test backend health
curl https://your-backend-url.onrender.com/api/health

# Check environment variables in Render
echo $MONGODB_URI
echo $JWT_SECRET
```

## **📞 Need Help?**

If you encounter issues:

1. **Check GitHub Actions logs**
   - Go to Actions tab → Click on failed workflow → View logs

2. **Check Render service logs**
   - Render dashboard → Your service → Logs tab

3. **Common solutions:**
   - Regenerate Docker Hub access token
   - Verify MongoDB connection string
   - Update GitHub secrets with correct values
   - Check Render environment variables

---

**🎉 Once all secrets are configured correctly, your CI/CD pipeline will automatically build and deploy your application whenever you push to the main branch!**
