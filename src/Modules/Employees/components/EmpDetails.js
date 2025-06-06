import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, ListGroup, ListGroupItem } from 'shards-react';
import { useDispatch, useSelector } from 'react-redux';
import { UploadPhoto } from 'elements';
import { setEmployees } from 'redux/actions/data';
import { showWarn } from 'functions';

const EmployeeDetails = ({ app, api, selectedEmployee }) => {
  const { employees } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const _setPhotoUrl = async photoURL => {
    //  showLog('setPhotoURL', photoURL);
    try {
      const employeeRef = app.firestore().collection('data/company/employees').doc(selectedEmployee.employeeCode);
      const docSnap = await employeeRef.get();
      if (docSnap.exists) {
        await employeeRef.update({
          ...docSnap.data(),
          photoURL
        });
      }

      // Update redux store.
      let mEmployees = JSON.parse(JSON.stringify(employees));
      mEmployees[selectedEmployee.employeeCode] = {
        ...mEmployees[selectedEmployee.employeeCode],
        photoURL
      };
      dispatch(setEmployees(mEmployees));
      // Update data.
      await api.updateData('employees');
    } catch (e) {
      showWarn(e);
    }
  };

  const grantEmployeeEdit =
    (user.permissions && user.permissions.permission702) ||
    user.isDev ||
    user.employeeCode === selectedEmployee.employeeCode;

  return (
    <Card small className="mb-4 pt-3">
      <CardHeader className="border-bottom text-center">
        <div className="mb-3 mx-auto ">
          <UploadPhoto
            disabled={!grantEmployeeEdit}
            src={selectedEmployee.photoURL}
            storeRef={`images/employees/${selectedEmployee.employeeCode}`}
            setUrl={_setPhotoUrl}
          />
        </div>
        <h5 className="mb-0">
          {!!selectedEmployee.firstName
            ? `${selectedEmployee.prefix}${selectedEmployee.firstName} ${selectedEmployee.lastName}`.trim()
            : ''}
        </h5>
        {selectedEmployee.position && (
          <span className="text-muted d-block mb-2">{selectedEmployee.jobTitle || selectedEmployee.position}</span>
        )}
        {/* <Button pill outline size="sm" className="mb-2">
        <i className="material-icons mr-1">person_add</i> Follow
      </Button> */}
      </CardHeader>
      <ListGroup flush>
        {/* <ListGroupItem className="px-4">
          <div className="progress-wrapper">
            <strong className="text-muted d-block mb-2">
              {selectedEmployee.performanceReportTitle}
            </strong>
            <Progress
              className="progress-sm"
              value={selectedEmployee.performanceReportValue}
            >
              <span className="progress-value">
                {selectedEmployee.performanceReportValue}%
              </span>
            </Progress>
          </div>
        </ListGroupItem> */}
        {selectedEmployee.description && (
          <ListGroupItem className="p-4">
            <strong className="text-muted d-block mb-2">Description</strong>
            <span>{selectedEmployee.description}</span>
          </ListGroupItem>
        )}
      </ListGroup>
    </Card>
  );
};

EmployeeDetails.propTypes = {
  /**
   * The employee details object.
   */
  employee: PropTypes.object
};

EmployeeDetails.defaultProps = {
  employeeDetails: {
    name: 'Chaiwat Benjapolkul',
    avatar: require('./../../../images/avatars/4.jpg'),
    jobTitle: 'Director',
    position: 'position001',
    performanceReportTitle: 'Workload',
    performanceReportValue: 74,
    metaTitle: 'Description',
    metaValue:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio eaque, qemployeeCodeem, commodi soluta qui quae minima obcaecati quod dolorum sint alias, possimus illum assumenda eligendi cumque?'
  }
};

export default EmployeeDetails;
