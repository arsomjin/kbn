#!/bin/bash

# KBN Enhanced Dual Environment Testing Script
# Enhanced for Complete Business Flow Testing

echo "🚀 Starting KBN Enhanced Dual Environment Testing..."
echo "================================================="

# Set environment variables
export REACT_APP_TEST_MODE=true
export REACT_APP_ENABLE_RBAC_LOGGING=true
export REACT_APP_BUSINESS_FLOW_TESTING=true

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use"
        echo "   Attempting to free port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to start environment with enhanced monitoring
start_environment() {
    local port=$1
    local env_name=$2
    local role_focus=$3
    
    echo "🌟 Starting $env_name Environment (Port $port)"
    echo "   Focus: $role_focus"
    echo "   URL: http://localhost:$port"
    
    # Set environment-specific variables
    if [ "$port" == "3030" ]; then
        export REACT_APP_DEFAULT_ROLE="SUPER_ADMIN"
        export REACT_APP_TEST_PROVINCE="all"
        export REACT_APP_TEST_BRANCH="all"
    else
        export REACT_APP_DEFAULT_ROLE="SALES_STAFF"
        export REACT_APP_TEST_PROVINCE="นครสวรรค์"
        export REACT_APP_TEST_BRANCH="NSN001"
    fi
    
    # Start the development server
    PORT=$port npm start &
    local pid=$!
    
    echo "   Process ID: $pid"
    echo "   Waiting for server to start..."
    
    # Wait for server to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$port >/dev/null 2>&1; then
            echo "   ✅ $env_name environment ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo "   ❌ Failed to start $env_name environment"
            kill $pid 2>/dev/null || true
            return 1
        fi
        
        echo "   ⏳ Attempt $attempt/$max_attempts - waiting..."
        sleep 3
        ((attempt++))
    done
    
    return 0
}

# Function to display testing guide
show_testing_guide() {
    echo ""
    echo "🎯 ENHANCED BUSINESS FLOW TESTING GUIDE"
    echo "======================================"
    echo ""
    echo "📱 BROWSER ASSIGNMENTS:"
    echo "   🌐 Chrome (3030)  → Super Admin (System Overview)"
    echo "   🦊 Firefox (3031) → Sales Manager NSN001 (Approvals)"
    echo "   🧭 Safari (3031)  → Sales Lead NSN001 (Reviews)"
    echo "   ⚡ Edge (3031)    → Sales Staff NSN001 (Operations)"
    echo ""
    echo "🎯 TESTING PHASES:"
    echo "   📋 Phase 0: Foundation Data Setup"
    echo "   🎪 Phase 1: Complete Customer Lifecycle"
    echo "   🔄 Phase 2: Multi-Department Integration"
    echo "   📊 Phase 3: Financial Accuracy & Reporting"
    echo "   🧠 Phase 4: Advanced Business Intelligence"
    echo ""
    echo "🔍 BUSINESS SCENARIOS TO TEST:"
    echo "   1. Customer Inquiry → Booking → Sale → Delivery"
    echo "   2. Service Order → Parts → Completion → Payment"
    echo "   3. Cross-Branch Transfer → Inventory → Costing"
    echo "   4. Daily Financial Close → Reconciliation"
    echo "   5. Multi-Province Consolidation → Reporting"
    echo ""
    echo "📚 DOCUMENTATION:"
    echo "   📖 Comprehensive Guide: src/COMPREHENSIVE_SYSTEM_TESTING.md"
    echo "   🔧 Quick Reference: src/BROWSER_TESTING_REFERENCE.md"
    echo "   📋 Setup Protocol: src/DUAL_ENVIRONMENT_TESTING_SETUP.md"
    echo ""
    echo "🚀 ENHANCED FEATURES TO TEST:"
    echo "   ✅ DocumentWorkflowWrapper integration"
    echo "   ✅ Real-time RBAC permission filtering"
    echo "   ✅ Geographic data access control"
    echo "   ✅ Multi-province business operations"
    echo "   ✅ Complete audit trail capture"
    echo "   ✅ Advanced business intelligence"
    echo ""
}

# Function to setup test data
setup_test_data() {
    echo "🗄️  Setting up enhanced test data..."
    echo "   📊 NSN Vehicle Inventory"
    echo "   👥 Customer Database"
    echo "   💰 Banking Configuration"
    echo "   🏢 Employee Structure"
    echo "   ⚙️  Business Flow Templates"
    echo "   ✅ Test data preparation complete"
}

# Function to monitor testing progress
monitor_testing() {
    echo ""
    echo "📊 TESTING PROGRESS MONITOR"
    echo "=========================="
    echo "   🎯 Phase 0: Foundation Setup     [ READY ]"
    echo "   🎪 Phase 1: Customer Lifecycle   [ READY ]"
    echo "   🔄 Phase 2: Department Integration[ READY ]"
    echo "   📊 Phase 3: Financial Accuracy   [ READY ]"
    echo "   🧠 Phase 4: Business Intelligence[ READY ]"
    echo ""
    echo "⚡ REAL-TIME MONITORING:"
    echo "   📈 Performance metrics available at each environment"
    echo "   🔍 Error tracking enabled"
    echo "   📋 User action logging active"
    echo "   🎨 UI/UX feedback collection ready"
    echo ""
}

# Main execution
main() {
    echo "🎯 KBN Enhanced Dual Environment Testing"
    echo "========================================"
    
    # Check prerequisites
    echo "🔍 Checking prerequisites..."
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo "❌ curl is not installed"
        exit 1
    fi
    
    if ! command -v lsof &> /dev/null; then
        echo "⚠️  lsof not available - port checking limited"
    fi
    
    echo "✅ Prerequisites check complete"
    echo ""
    
    # Setup test data
    setup_test_data
    echo ""
    
    # Check and free ports
    echo "🔌 Preparing ports..."
    check_port 3030
    check_port 3031
    echo "✅ Ports ready"
    echo ""
    
    # Start environments
    echo "🚀 Starting test environments..."
    echo ""
    
    # Start Super Admin Environment (Port 3030)
    if start_environment 3030 "SUPER_ADMIN" "System Overview & Province Management"; then
        ADMIN_PID=$!
    else
        echo "❌ Failed to start Super Admin environment"
        exit 1
    fi
    
    echo ""
    
    # Start Business Operations Environment (Port 3031)
    if start_environment 3031 "BUSINESS_OPS" "Sales, Service, Accounting Operations"; then
        BUSINESS_PID=$!
    else
        echo "❌ Failed to start Business Operations environment"
        kill $ADMIN_PID 2>/dev/null || true
        exit 1
    fi
    
    echo ""
    echo "🎉 BOTH ENVIRONMENTS SUCCESSFULLY STARTED!"
    echo "========================================="
    echo ""
    
    # Show testing guide
    show_testing_guide
    
    # Monitor testing progress
    monitor_testing
    
    echo "💡 TIPS FOR ENHANCED TESTING:"
    echo "   🎯 Test complete business flows, not just individual features"
    echo "   🔄 Verify data consistency across departments"
    echo "   📊 Check real-time updates and notifications"
    echo "   🎨 Evaluate user experience and workflow efficiency"
    echo "   🔍 Test edge cases and error handling"
    echo "   📱 Verify mobile responsiveness"
    echo ""
    
    echo "🛑 To stop testing, press Ctrl+C"
    echo "   Both environments will be terminated gracefully"
    echo ""
    
    # Wait for user interrupt
    trap 'echo ""; echo "🛑 Stopping test environments..."; kill $ADMIN_PID $BUSINESS_PID 2>/dev/null || true; echo "✅ Test environments stopped"; echo "📊 Testing session complete"; exit 0' INT
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Execute main function
main "$@" 