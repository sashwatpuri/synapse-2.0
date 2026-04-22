export function FarmerManagementSection({
  role,
  farmers,
  farmerSearch,
  activeFarmer,
  activeFarmerPlots,
  activeFarmerRecords,
  activeFarmerAccount,
  newFarmerForm,
  onFarmerSearchChange,
  onSelectAdminFarmer,
  onNewFarmerInputChange,
  onCreateFarmer,
  onUpdateFarmer
}) {
  const createAndReset = () => {
    const result = onCreateFarmer();
    if (result.ok && result.credentials) {
      window.alert(`Farmer created.\nUsername: ${result.credentials.username}\nPassword: ${result.credentials.password}`);
    } else if (!result.ok) {
      window.alert(result.message);
    }
  };

  return (
    <section className="layout">
      {role === "admin" ? (
        <div className="section reveal" style={{ animationDelay: "0.14s" }}>
          <div className="section-header">
            <div>
              <h2>Farmer Directory</h2>
              <p>Admin can search, add, and inspect complete farmer profiles with unique public IDs.</p>
            </div>
          </div>

          <label className="control">
            Search farmers
            <input
              value={farmerSearch}
              onChange={(event) => onFarmerSearchChange(event.target.value)}
              placeholder="Search by name, ID, contact, registration"
            />
          </label>

          <div className="farmer-list">
            {farmers.map((farmer) => (
              <button
                key={farmer.farmer_id}
                className={`farmer-list-item ${activeFarmer?.farmer_id === farmer.farmer_id ? "active" : ""}`}
                type="button"
                onClick={() => onSelectAdminFarmer(String(farmer.farmer_id))}
              >
                <strong>{farmer.name}</strong>
                <span>{farmer.public_farmer_uid}</span>
                <span>{farmer.status}</span>
              </button>
            ))}
          </div>

          <div className="subsection">
            <h3>Create Farmer</h3>
            <div className="form-grid">
              <label className="control">
                Full name
                <input value={newFarmerForm.name} onChange={(event) => onNewFarmerInputChange("name", event.target.value)} />
              </label>
              <label className="control">
                Contact
                <input value={newFarmerForm.contact} onChange={(event) => onNewFarmerInputChange("contact", event.target.value)} />
              </label>
              <label className="control">
                Pincode
                <input value={newFarmerForm.pincode} onChange={(event) => onNewFarmerInputChange("pincode", event.target.value)} />
              </label>
              <label className="control">
                Registration No
                <input value={newFarmerForm.registration_no} onChange={(event) => onNewFarmerInputChange("registration_no", event.target.value)} />
              </label>
              <label className="control">
                Village
                <input value={newFarmerForm.village} onChange={(event) => onNewFarmerInputChange("village", event.target.value)} />
              </label>
              <label className="control">
                Status
                <select value={newFarmerForm.status} onChange={(event) => onNewFarmerInputChange("status", event.target.value)}>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </div>
            <label className="control">
              Admin notes
              <input value={newFarmerForm.notes} onChange={(event) => onNewFarmerInputChange("notes", event.target.value)} />
            </label>
            <button onClick={createAndReset}>Create Farmer Profile</button>
          </div>
        </div>
      ) : null}

      <div className="section reveal" style={{ animationDelay: "0.17s" }}>
        <div className="section-header">
          <div>
            <h2>{role === "admin" ? "Farmer Profile Access" : "My Farmer Profile"}</h2>
            <p>
              {role === "admin"
                ? "Complete farmer profile with account credentials, plots, and report history."
                : "This account is restricted to the logged-in farmer scope."}
            </p>
          </div>
        </div>

        {activeFarmer ? (
          <>
            <div className="profile-grid">
              <label className="control">
                Public Farmer ID
                <input value={activeFarmer.public_farmer_uid} readOnly />
              </label>
              <label className="control">
                Name
                <input
                  value={activeFarmer.name}
                  readOnly={role !== "admin"}
                  onChange={(event) => onUpdateFarmer(activeFarmer.farmer_id, { name: event.target.value })}
                />
              </label>
              <label className="control">
                Contact
                <input
                  value={activeFarmer.contact}
                  readOnly={role !== "admin"}
                  onChange={(event) => onUpdateFarmer(activeFarmer.farmer_id, { contact: event.target.value })}
                />
              </label>
              <label className="control">
                Registration
                <input
                  value={activeFarmer.registration_no}
                  readOnly={role !== "admin"}
                  onChange={(event) => onUpdateFarmer(activeFarmer.farmer_id, { registration_no: event.target.value })}
                />
              </label>
              <label className="control">
                Pincode
                <input
                  value={activeFarmer.pincode}
                  readOnly={role !== "admin"}
                  onChange={(event) => onUpdateFarmer(activeFarmer.farmer_id, { pincode: event.target.value })}
                />
              </label>
              <label className="control">
                Village
                <input
                  value={activeFarmer.village || ""}
                  readOnly={role !== "admin"}
                  onChange={(event) => onUpdateFarmer(activeFarmer.farmer_id, { village: event.target.value })}
                />
              </label>
              <label className="control">
                Status
                <select
                  value={activeFarmer.status}
                  disabled={role !== "admin"}
                  onChange={(event) => onUpdateFarmer(activeFarmer.farmer_id, { status: event.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
              <label className="control">
                Login Username
                <input value={activeFarmerAccount?.username || "-"} readOnly />
              </label>
              <label className="control">
                Login Password
                <input value={activeFarmerAccount?.password || "-"} readOnly />
              </label>
            </div>

            <label className="control">
              Notes
              <input
                value={activeFarmer.notes || ""}
                readOnly={role !== "admin"}
                onChange={(event) => onUpdateFarmer(activeFarmer.farmer_id, { notes: event.target.value })}
              />
            </label>

            <div className="mini-stats">
              <div className="calc-box">
                <div className="label">Owned Plots</div>
                <div className="value">{activeFarmerPlots.length}</div>
              </div>
              <div className="calc-box">
                <div className="label">Certification Records</div>
                <div className="value">{activeFarmerRecords.length}</div>
              </div>
              <div className="calc-box">
                <div className="label">Latest Status</div>
                <div className="value">{activeFarmer.status}</div>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Plot</th>
                    <th>Location</th>
                    <th>Area (ha)</th>
                    <th>Soil Type</th>
                    <th>Bulk Density</th>
                  </tr>
                </thead>
                <tbody>
                  {activeFarmerPlots.map((plot) => (
                    <tr key={plot.plot_id}>
                      <td>{plot.plot_id}</td>
                      <td>{plot.location}</td>
                      <td>{plot.area_hectare}</td>
                      <td>{plot.soilTypeName}</td>
                      <td>{plot.bulk_density_g_per_cm3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="metric-sub">No farmer selected.</p>
        )}
      </div>
    </section>
  );
}
