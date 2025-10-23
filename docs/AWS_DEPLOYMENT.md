# DealPop AWS Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the entire DealPop system to AWS. The system uses multiple AWS services to provide a scalable, secure, and cost-effective infrastructure.

## What This Guide Covers

This deployment guide covers:
- **Complete AWS Infrastructure Setup**: All required AWS services and configurations
- **Frontend Deployment**: React application to S3 + CloudFront
- **Backend API Deployment**: Node.js API to App Runner
- **Price Checker Deployment**: Automated scraping service to App Runner
- **Database Setup**: PostgreSQL on RDS
- **Security Configuration**: IAM roles, secrets management, and access control
- **Monitoring & Logging**: CloudWatch setup and alerting
- **Cost Optimization**: Strategies for minimizing AWS costs
- **Disaster Recovery**: Backup and recovery procedures

## AWS Services Used

### Core Infrastructure
- **S3 + CloudFront**: Frontend hosting and global CDN
- **App Runner**: Backend API and Price Checker hosting
- **RDS PostgreSQL**: Database hosting with automated backups
- **Route 53**: DNS management (optional)
- **Secrets Manager**: Secure storage of API keys and passwords

### Supporting Services
- **IAM**: Identity and access management
- **CloudWatch**: Monitoring, logging, and alerting
- **SES/SendGrid**: Email notifications
- **SNS**: SMS notifications (optional)
- **VPC**: Network isolation and security

## Prerequisites

### Required Tools
- **AWS CLI**: Configured with appropriate permissions
- **Docker**: For containerized deployments
- **Node.js 18+**: For local development and building
- **Git**: For code management

### Required AWS Permissions
Your AWS user/role needs permissions for:
- S3 (bucket creation, file uploads)
- CloudFront (distribution management)
- App Runner (service creation and management)
- RDS (database creation and management)
- IAM (role and policy creation)
- Secrets Manager (secret creation and access)
- CloudWatch (log groups and metrics)

## Step 1: AWS Account Setup

### 1.1 Create AWS Account
1. Sign up for AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Set up billing alerts to monitor costs
3. Enable MFA for root account
4. Create IAM user with programmatic access

### 1.2 Configure AWS CLI
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter your Access Key ID, Secret Access Key, region (us-east-2), and output format (json)
```

### 1.3 Verify Setup
```bash
# Test AWS CLI configuration
aws sts get-caller-identity

# List available regions
aws ec2 describe-regions --query 'Regions[].RegionName'
```

## Step 2: Database Setup (RDS PostgreSQL)

### 2.1 Create RDS Instance
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier dealpop-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username dealpop \
    --master-user-password 'YourSecurePassword123!' \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --deletion-protection
```

### 2.2 Configure Security Group
```bash
# Create security group for RDS
aws ec2 create-security-group \
    --group-name dealpop-rds-sg \
    --description "Security group for DealPop RDS instance"

# Allow PostgreSQL access from App Runner
aws ec2 authorize-security-group-ingress \
    --group-name dealpop-rds-sg \
    --protocol tcp \
    --port 5432 \
    --source-group dealpop-app-sg
```

### 2.3 Store Database Credentials
```bash
# Store database password in Secrets Manager
aws secretsmanager create-secret \
    --name "dealpop/database/password" \
    --description "DealPop database password" \
    --secret-string "YourSecurePassword123!"

# Store database connection string
aws secretsmanager create-secret \
    --name "dealpop/database/connection" \
    --description "DealPop database connection string" \
    --secret-string "postgresql://dealpop:YourSecurePassword123!@dealpop-db.xxxxxxxxx.us-east-2.rds.amazonaws.com:5432/dealpop"
```

## Step 3: Frontend Deployment (S3 + CloudFront)

### 3.1 Create S3 Bucket
```bash
# Create S3 bucket for frontend
aws s3 mb s3://dealpop-frontend-prod

# Enable static website hosting
aws s3 website s3://dealpop-frontend-prod \
    --index-document index.html \
    --error-document index.html

# Configure bucket policy for public read access
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::dealpop-frontend-prod/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket dealpop-frontend-prod \
    --policy file://bucket-policy.json
```

### 3.2 Create CloudFront Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

**cloudfront-config.json**:
```json
{
    "CallerReference": "dealpop-frontend-$(date +%s)",
    "Comment": "DealPop Frontend Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-dealpop-frontend-prod",
                "DomainName": "dealpop-frontend-prod.s3-website.us-east-2.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-dealpop-frontend-prod",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
```

### 3.3 Deploy Frontend
```bash
# Navigate to frontend directory
cd /path/to/dealpop-frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to S3
aws s3 sync dist/ s3://dealpop-frontend-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"
```

## Step 4: Backend API Deployment (App Runner)

### 4.1 Create App Runner Service
```bash
# Create App Runner service for backend API
aws apprunner create-service \
    --service-name dealpop-backend-api \
    --source-configuration file://backend-source-config.json \
    --instance-configuration file://backend-instance-config.json
```

**backend-source-config.json**:
```json
{
    "CodeRepository": {
        "RepositoryUrl": "https://github.com/your-username/deal-pop",
        "SourceCodeVersion": {
            "Type": "BRANCH",
            "Value": "main"
        },
        "CodeConfiguration": {
            "ConfigurationSource": "API",
            "CodeConfigurationValues": {
                "Runtime": "NODEJS_18",
                "BuildCommand": "cd backend-api && npm install",
                "StartCommand": "cd backend-api && npm start",
                "RuntimeEnvironmentVariables": {
                    "NODE_ENV": "production",
                    "PORT": "3000"
                }
            }
        }
    },
    "AutoDeploymentsEnabled": true
}
```

**backend-instance-config.json**:
```json
{
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB",
    "InstanceRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/DealPopAppRunnerRole"
}
```

### 4.2 Create IAM Role for App Runner
```bash
# Create trust policy for App Runner
cat > apprunner-trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "build.apprunner.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Create IAM role
aws iam create-role \
    --role-name DealPopAppRunnerRole \
    --assume-role-policy-document file://apprunner-trust-policy.json

# Attach policies for database and secrets access
aws iam attach-role-policy \
    --role-name DealPopAppRunnerRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

aws iam attach-role-policy \
    --role-name DealPopAppRunnerRole \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### 4.3 Configure Environment Variables
```bash
# Store backend environment variables in Secrets Manager
aws secretsmanager create-secret \
    --name "dealpop/backend/environment" \
    --description "DealPop backend environment variables" \
    --secret-string '{
        "DB_HOST": "dealpop-db.xxxxxxxxx.us-east-2.rds.amazonaws.com",
        "DB_PORT": "5432",
        "DB_NAME": "dealpop",
        "DB_USER": "dealpop",
        "FIREBASE_PROJECT_ID": "your-firebase-project-id",
        "INTERNAL_API_KEY": "your-internal-api-key",
        "SENDGRID_API_KEY": "your-sendgrid-api-key",
        "TWILIO_ACCOUNT_SID": "your-twilio-account-sid",
        "TWILIO_AUTH_TOKEN": "your-twilio-auth-token"
    }'
```

## Step 5: Price Checker Deployment (App Runner)

### 5.1 Create Price Checker Service
```bash
# Create App Runner service for price checker
aws apprunner create-service \
    --service-name dealpop-price-checker \
    --source-configuration file://price-checker-source-config.json \
    --instance-configuration file://price-checker-instance-config.json
```

**price-checker-source-config.json**:
```json
{
    "CodeRepository": {
        "RepositoryUrl": "https://github.com/your-username/deal-pop",
        "SourceCodeVersion": {
            "Type": "BRANCH",
            "Value": "main"
        },
        "CodeConfiguration": {
            "ConfigurationSource": "API",
            "CodeConfigurationValues": {
                "Runtime": "NODEJS_18",
                "BuildCommand": "cd puppeteer-scraper && npm install",
                "StartCommand": "cd puppeteer-scraper && npm start",
                "RuntimeEnvironmentVariables": {
                    "NODE_ENV": "production",
                    "PORT": "3001"
                }
            }
        }
    },
    "AutoDeploymentsEnabled": true
}
```

## Step 6: Domain Configuration (Route 53)

### 6.1 Create Hosted Zone
```bash
# Create hosted zone for your domain
aws route53 create-hosted-zone \
    --name dealpop.co \
    --caller-reference "dealpop-$(date +%s)"
```

### 6.2 Create DNS Records
```bash
# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch file://dns-records.json
```

**dns-records.json**:
```json
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "dealpop.co",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "YOUR_CLOUDFRONT_DOMAIN",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        },
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "www.dealpop.co",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "dealpop.co"
                    }
                ]
            }
        }
    ]
}
```

## Step 7: Monitoring & Logging Setup

### 7.1 Create CloudWatch Log Groups
```bash
# Create log groups for each service
aws logs create-log-group --log-group-name /aws/apprunner/dealpop-backend-api
aws logs create-log-group --log-group-name /aws/apprunner/dealpop-price-checker
aws logs create-log-group --log-group-name /aws/rds/dealpop-db
```

### 7.2 Create CloudWatch Alarms
```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
    --alarm-name "DealPop-High-Error-Rate" \
    --alarm-description "High error rate in DealPop API" \
    --metric-name "4xxError" \
    --namespace "AWS/AppRunner" \
    --statistic "Sum" \
    --period 300 \
    --threshold 10 \
    --comparison-operator "GreaterThanThreshold" \
    --evaluation-periods 2
```

### 7.3 Set Up SNS Notifications
```bash
# Create SNS topic for alerts
aws sns create-topic --name dealpop-alerts

# Subscribe to email notifications
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-2:YOUR_ACCOUNT_ID:dealpop-alerts \
    --protocol email \
    --notification-endpoint your-email@example.com
```

## Step 8: Security Configuration

### 8.1 Configure CORS for API
Update your backend API to include proper CORS configuration:

```javascript
// In your backend API
const corsOptions = {
    origin: [
        'https://dealpop.co',
        'https://www.dealpop.co',
        'https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net',
        'chrome-extension://YOUR_EXTENSION_ID'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 8.2 Set Up WAF (Optional)
```bash
# Create WAF web ACL for additional security
aws wafv2 create-web-acl \
    --name DealPopWebACL \
    --scope CLOUDFRONT \
    --default-action Allow={} \
    --rules file://waf-rules.json
```

## Step 9: Cost Optimization

### 9.1 Estimated Monthly Costs

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| **S3** | 1GB storage, 10K requests | $0.50 |
| **CloudFront** | 100GB transfer, 1M requests | $10.00 |
| **App Runner** | 2 services, 0.25 vCPU each | $25.00 |
| **RDS** | db.t3.micro, 20GB storage | $15.00 |
| **Route 53** | 1 hosted zone, 1M queries | $1.00 |
| **Secrets Manager** | 2 secrets | $0.80 |
| **CloudWatch** | Logs and metrics | $5.00 |
| **Total** | | **~$57/month** |

### 9.2 Cost Optimization Strategies

1. **Use Reserved Instances**: For predictable workloads
2. **Enable Auto Scaling**: Scale down during low usage
3. **Optimize CloudFront**: Use appropriate cache settings
4. **Monitor Usage**: Set up billing alerts
5. **Clean Up Resources**: Remove unused resources regularly

## Step 10: Deployment Automation

### 10.1 Create Deployment Scripts

**deploy-frontend.sh**:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying DealPop Frontend..."

# Build the application
npm run build

# Deploy to S3
aws s3 sync dist/ s3://dealpop-frontend-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"

echo "✅ Frontend deployment complete!"
```

**deploy-backend.sh**:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying DealPop Backend API..."

# Trigger App Runner deployment
aws apprunner start-deployment \
    --service-arn $BACKEND_SERVICE_ARN

echo "✅ Backend deployment complete!"
```

### 10.2 Set Up CI/CD Pipeline

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: aws s3 sync dist/ s3://dealpop-frontend-prod --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## Step 11: Disaster Recovery

### 11.1 Backup Strategy
- **Database**: Automated daily backups with 7-day retention
- **Code**: Git repositories with multiple remotes
- **Configuration**: Infrastructure as Code
- **Secrets**: AWS Secrets Manager with versioning

### 11.2 Recovery Procedures

**Database Recovery**:
```bash
# Restore from latest backup
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier dealpop-db-restored \
    --db-snapshot-identifier dealpop-db-snapshot-YYYY-MM-DD
```

**Application Recovery**:
```bash
# Redeploy from Git
git checkout main
git pull origin main
./deploy-frontend.sh
./deploy-backend.sh
```

## Step 12: Testing & Validation

### 12.1 Health Checks
```bash
# Test frontend
curl -I https://dealpop.co

# Test backend API
curl -I https://YOUR_APP_RUNNER_URL/health

# Test database connection
aws rds describe-db-instances --db-instance-identifier dealpop-db
```

### 12.2 End-to-End Testing
1. **User Registration**: Test Firebase authentication
2. **Product Tracking**: Test Chrome extension integration
3. **Price Monitoring**: Test price checker functionality
4. **Alert System**: Test email/SMS notifications
5. **Performance**: Test response times and load handling

## Troubleshooting

### Common Issues

**Frontend not loading**:
- Check S3 bucket permissions
- Verify CloudFront distribution status
- Check DNS configuration

**Backend API errors**:
- Check App Runner service status
- Verify environment variables
- Check database connectivity

**Database connection issues**:
- Verify security group rules
- Check database credentials
- Ensure database is running

**Chrome Extension issues**:
- Verify CORS configuration
- Check extension ID in frontend
- Test authentication flow

### Debug Commands
```bash
# Check App Runner service status
aws apprunner describe-service --service-arn $SERVICE_ARN

# View CloudWatch logs
aws logs tail /aws/apprunner/dealpop-backend-api --follow

# Check RDS instance status
aws rds describe-db-instances --db-instance-identifier dealpop-db

# Test S3 bucket access
aws s3 ls s3://dealpop-frontend-prod
```

## Maintenance

### Regular Tasks
- **Weekly**: Review CloudWatch metrics and logs
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize costs
- **Annually**: Review and update security configurations

### Monitoring Checklist
- [ ] Application performance metrics
- [ ] Database performance and connections
- [ ] Error rates and response times
- [ ] Cost and usage patterns
- [ ] Security events and access logs

---

This deployment guide provides a complete foundation for running DealPop on AWS. For specific component details, refer to the individual documentation files for each repository.
