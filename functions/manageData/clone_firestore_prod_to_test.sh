#!/bin/bash

# 🔧 Config
# chmod +x clone_firestore_prod_to_test.sh
# ./clone_firestore_prod_to_test.sh
PROD_PROJECT="kubota-benjapol"
TEST_PROJECT="kubota-benjapol-test"
PROD_BUCKET="kubota-prod-backup-asia"
TEST_BUCKET="kubota-test-backup-asia"
DATE=$(date +%Y%m%d)
FOLDER="firestore-backup-$DATE"

echo "📤 Exporting Firestore from $PROD_PROJECT..."
gcloud config set project $PROD_PROJECT
gcloud firestore export gs://$PROD_BUCKET/$FOLDER

echo "📦 Copying backup to test bucket..."
gsutil -m cp -r gs://$PROD_BUCKET/$FOLDER gs://$TEST_BUCKET/

echo "📥 Importing to Firestore in $TEST_PROJECT..."
gcloud config set project $TEST_PROJECT
gcloud firestore import gs://$TEST_BUCKET/$FOLDER

echo "✅ Firestore clone completed from $PROD_PROJECT to $TEST_PROJECT."
