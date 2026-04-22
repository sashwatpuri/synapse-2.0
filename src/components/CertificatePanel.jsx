export function CertificatePanel({ selectedRecord, onExportCertificate, onPreviewCertificate }) {
  if (!selectedRecord) return null;

  return (
    <div className="section reveal" style={{ animationDelay: "0.38s" }}>
      <div className="section-header">
        <div>
          <h2>Certificate Workflow</h2>
          <p>Auto-evaluated certificate output for the selected certification record.</p>
        </div>
        <div className="toolbar" style={{ position: "static", padding: 0, border: 0, background: "none" }}>
          <button className="secondary" onClick={onPreviewCertificate}>Preview Certificate</button>
          <button className="export" onClick={onExportCertificate}>Download Certificate</button>
        </div>
      </div>

      <div className="calc-grid">
        <div className="calc-box">
          <div className="label">Certificate ID</div>
          <div className="value">{selectedRecord.certificateId}</div>
        </div>
        <div className="calc-box">
          <div className="label">Status</div>
          <div className="value">{selectedRecord.certificateStatus}</div>
        </div>
        <div className="calc-box">
          <div className="label">Verification Code</div>
          <div className="value">{selectedRecord.verificationCode}</div>
        </div>
        <div className="calc-box">
          <div className="label">Issued On</div>
          <div className="value">{selectedRecord.certificateIssuedOn || "-"}</div>
        </div>
        <div className="calc-box">
          <div className="label">Valid Until</div>
          <div className="value">{selectedRecord.certificateValidUntil || "-"}</div>
        </div>
        <div className="calc-box">
          <div className="label">Verifier</div>
          <div className="value">{selectedRecord.verifierName}</div>
        </div>
      </div>

      <p className="footnote">
        {selectedRecord.approvalNotes || "No approval note added yet. Certificate state is determined automatically from the selected record."}
      </p>
      <p className="footnote">
        {selectedRecord.isEligible
          ? "This record is eligible, so the certificate status can progress automatically."
          : "This record is not eligible, so the certificate remains non-issued or under review."}
      </p>
    </div>
  );
}
