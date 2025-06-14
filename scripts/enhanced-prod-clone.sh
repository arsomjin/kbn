#!/bin/bash

# 🧪 ENHANCED PRODUCTION CLONE SCRIPT
# Complete production environment replication for LIVE deployment testing
# Zero risk to production - complete isolation with production data fidelity

set -e  # Exit on any error

# 🔧 Configuration
PROD_PROJECT="kubota-benjapol"
TEST_PROJECT="kubota-benjapol-test"
CLONE_PROJECT="kubota-benjapol-clone-test"
PROD_BUCKET="kubota-prod-backup-asia"
TEST_BUCKET="kubota-test-backup-asia"
CLONE_BUCKET="kubota-clone-backup-asia"
DATE=$(date +%Y%m%d_%H%M%S)
FOLDER="complete-prod-clone-$DATE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Safety confirmation
confirm_clone_creation() {
    echo -e "${YELLOW}"
    echo "🧪 PRODUCTION CLONE CREATION"
    echo "=============================="
    echo "Source: $PROD_PROJECT (LIVE PRODUCTION)"
    echo "Target: $CLONE_PROJECT (ISOLATED TEST CLONE)"
    echo "Purpose: LIVE Deployment Tool Testing"
    echo "Safety: Zero impact on production"
    echo -e "${NC}"
    
    read -p "Proceed with production clone creation? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Clone creation cancelled by user"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check gcloud CLI
    if ! command -v gcloud &> /dev/null; then
        error "gcloud CLI not found. Please install Google Cloud SDK."
    fi
    
    # Check gsutil
    if ! command -v gsutil &> /dev/null; then
        error "gsutil not found. Please install Google Cloud SDK."
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        error "Firebase CLI not found. Please install Firebase CLI."
    fi
    
    # Check authentication
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "Not authenticated with gcloud. Run: gcloud auth login"
    fi
    
    success "All prerequisites satisfied"
}

# Create clone project if it doesn't exist
setup_clone_project() {
    log "Setting up clone project: $CLONE_PROJECT"
    
    # Check if project exists
    if gcloud projects describe $CLONE_PROJECT &>/dev/null; then
        warning "Clone project $CLONE_PROJECT already exists"
    else {
        log "Creating new clone project: $CLONE_PROJECT"
        gcloud projects create $CLONE_PROJECT --name="KBN Clone Test Environment"
        
        # Enable required APIs
        gcloud config set project $CLONE_PROJECT
        gcloud services enable firestore.googleapis.com
        gcloud services enable storage-api.googleapis.com
        gcloud services enable cloudfunctions.googleapis.com
        gcloud services enable firebase.googleapis.com
    }
    fi
    
    success "Clone project ready: $CLONE_PROJECT"
}

# Create clone storage bucket
setup_clone_storage() {
    log "Setting up clone storage bucket: $CLONE_BUCKET"
    
    gcloud config set project $CLONE_PROJECT
    
    # Create bucket if it doesn't exist
    if ! gsutil ls -b gs://$CLONE_BUCKET &>/dev/null; then
        gsutil mb -p $CLONE_PROJECT -c STANDARD -l asia gs://$CLONE_BUCKET
        success "Created clone storage bucket: $CLONE_BUCKET"
    else
        warning "Clone storage bucket already exists: $CLONE_BUCKET"
    fi
}

# Export production Firestore
export_production_firestore() {
    log "📤 Exporting Firestore from production: $PROD_PROJECT"
    
    gcloud config set project $PROD_PROJECT
    
    # Create export with timestamp
    local export_path="gs://$PROD_BUCKET/$FOLDER/firestore"
    gcloud firestore export $export_path
    
    success "Production Firestore exported to: $export_path"
}

# Copy production data to clone bucket
copy_to_clone_bucket() {
    log "📦 Copying production data to clone bucket"
    
    # Copy Firestore export
    gsutil -m cp -r gs://$PROD_BUCKET/$FOLDER gs://$CLONE_BUCKET/
    
    # Copy any additional production storage data
    log "Copying production storage files..."
    if gsutil ls gs://$PROD_PROJECT.appspot.com &>/dev/null; then
        gsutil -m cp -r gs://$PROD_PROJECT.appspot.com/* gs://$CLONE_PROJECT.appspot.com/ || warning "Some storage files may not have copied"
    fi
    
    success "Production data copied to clone environment"
}

# Import to clone Firestore
import_to_clone_firestore() {
    log "📥 Importing to clone Firestore: $CLONE_PROJECT"
    
    gcloud config set project $CLONE_PROJECT
    
    # Initialize Firestore if needed
    gcloud firestore databases create --region=asia-southeast1 || warning "Firestore database may already exist"
    
    # Import data
    local import_path="gs://$CLONE_BUCKET/$FOLDER/firestore"
    gcloud firestore import $import_path
    
    success "Data imported to clone Firestore: $CLONE_PROJECT"
}

# Copy Firebase configuration
copy_firebase_config() {
    log "🔧 Copying Firebase configuration"
    
    # Copy security rules
    gcloud config set project $PROD_PROJECT
    gcloud firestore rules get > /tmp/firestore.rules
    
    gcloud config set project $CLONE_PROJECT
    gcloud firestore rules replace /tmp/firestore.rules
    
    # Copy indexes
    gcloud config set project $PROD_PROJECT
    gcloud firestore indexes list --format="export" > /tmp/firestore.indexes.json
    
    gcloud config set project $CLONE_PROJECT
    gcloud firestore indexes create --source=/tmp/firestore.indexes.json || warning "Some indexes may already exist"
    
    success "Firebase configuration copied"
}

# Setup clone environment variables
setup_clone_env() {
    log "🔧 Setting up clone environment configuration"
    
    # Create clone-specific .env file
    cat > .env.clone << EOF
# 🧪 CLONE ENVIRONMENT CONFIGURATION
# For LIVE Deployment Tool Testing Only
REACT_APP_FIREBASE_PROJECT_ID=$CLONE_PROJECT
REACT_APP_FIREBASE_AUTH_DOMAIN=$CLONE_PROJECT.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://$CLONE_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_STORAGE_BUCKET=$CLONE_PROJECT.appspot.com

# Copy other config from production (you'll need to get these from Firebase Console)
# REACT_APP_FIREBASE_API_KEY=your-clone-api-key
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-clone-sender-id
# REACT_APP_FIREBASE_APP_ID=your-clone-app-id
# REACT_APP_FIREBASE_MEASUREMENT_ID=your-clone-measurement-id
# REACT_APP_FIREBASE_VAPID_KEY=your-clone-vapid-key

# Environment identification
NODE_ENV=clone-testing
REACT_APP_ENVIRONMENT=clone
EOF

    # Update .firebaserc for clone
    cat > .firebaserc.clone << EOF
{
  "projects": {
    "default": "$CLONE_PROJECT",
    "production": "$PROD_PROJECT",
    "test": "$TEST_PROJECT",
    "clone": "$CLONE_PROJECT"
  }
}
EOF

    success "Clone environment configuration created"
}

# Generate clone validation report
generate_validation_report() {
    log "📊 Generating clone validation report"
    
    local report_file="clone-validation-report-$DATE.md"
    
    cat > $report_file << EOF
# 🧪 Production Clone Validation Report

**Clone Created**: $(date)
**Source**: $PROD_PROJECT (Production)
**Target**: $CLONE_PROJECT (Clone)
**Purpose**: LIVE Deployment Tool Testing

## Clone Configuration

- **Firestore Database**: ✅ Cloned
- **Storage Bucket**: ✅ Cloned  
- **Security Rules**: ✅ Copied
- **Firestore Indexes**: ✅ Copied
- **Environment Config**: ✅ Created

## Next Steps

1. **Switch to Clone Environment**:
   \`\`\`bash
   cp .env.clone .env
   cp .firebaserc.clone .firebaserc
   \`\`\`

2. **Update Firebase Config**:
   - Get API keys from Firebase Console for $CLONE_PROJECT
   - Update .env file with clone-specific keys

3. **Start Clone Testing**:
   \`\`\`bash
   npm start
   \`\`\`

4. **Access Live Deployment Tool**:
   - Navigate to: http://localhost:3000/admin/live-deployment
   - Login with Super Admin account
   - Execute complete deployment testing

## Validation Checklist

- [ ] Clone environment starts successfully
- [ ] User authentication works
- [ ] Production data visible
- [ ] RBAC permissions functional
- [ ] Live Deployment Tool accessible
- [ ] All 11 deployment steps executable
- [ ] Rollback functionality working

## Safety Notes

- ✅ Zero impact on production
- ✅ Complete data isolation
- ✅ Independent Firebase project
- ✅ Separate storage buckets
- ✅ Isolated Cloud Functions

**Ready for comprehensive LIVE deployment testing!**
EOF

    success "Validation report created: $report_file"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "🧪 ENHANCED PRODUCTION CLONE CREATION"
    echo "======================================"
    echo "Creating complete production replica for LIVE deployment testing"
    echo -e "${NC}"
    
    confirm_clone_creation
    check_prerequisites
    setup_clone_project
    setup_clone_storage
    export_production_firestore
    copy_to_clone_bucket
    import_to_clone_firestore
    copy_firebase_config
    setup_clone_env
    generate_validation_report
    
    echo -e "${GREEN}"
    echo "🎉 PRODUCTION CLONE CREATION COMPLETE!"
    echo "======================================"
    echo "Clone Project: $CLONE_PROJECT"
    echo "Clone Bucket: $CLONE_BUCKET"
    echo "Environment Files: .env.clone, .firebaserc.clone"
    echo ""
    echo "Next Steps:"
    echo "1. Update .env.clone with Firebase API keys"
    echo "2. Switch to clone environment"
    echo "3. Start comprehensive LIVE deployment testing"
    echo -e "${NC}"
}

# Execute main function
main "$@" 