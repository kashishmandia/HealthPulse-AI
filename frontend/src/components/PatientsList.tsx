
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
}

interface Props {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
}

export default function PatientsList({ patients, onSelectPatient }: Props) {
  return (
    <div className="card patients-list">
      <h2>My Patients ({patients.length})</h2>

      {patients.length === 0 ? (
        <p className="empty-state">No patients assigned yet</p>
      ) : (
        <div className="patient-items">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="patient-item"
              onClick={() => onSelectPatient(patient.id)}
            >
              <div className="patient-info">
                <h3>
                  {patient.first_name} {patient.last_name}
                </h3>
                <p>{patient.email}</p>
              </div>
              <div className="patient-action">
                <span className="arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
