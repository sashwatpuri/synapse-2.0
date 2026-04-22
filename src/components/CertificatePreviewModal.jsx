import { formatNumber } from "../services/carbonService";

export function CertificatePreviewModal({ record, onClose }) {
  if (!record) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card certificate-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Certificate preview">
        <div className="certificate-sheet">
          <div className="certificate-banner">
            <div>
              <h1>Soil Carbon Credit Certificate</h1>
              <p>Official preview for issued and review-stage certifications.</p>
            </div>
            <div className={`badge ${record.certificateStatus === "ISSUED" ? "green" : "amber"}`}>
              {record.certificateStatus.replace("_", " ")}
            </div>
          </div>

          <div className="certificate-grid">
            <div className="certificate-block">
              <span>Certificate ID</span>
              <strong>{record.certificateId}</strong>
            </div>
            <div className="certificate-block">
              <span>Verification Code</span>
              <strong>{record.verificationCode}</strong>
            </div>
            <div className="certificate-block">
              <span>Farmer</span>
              <strong>{record.farmer}</strong>
            </div>
            <div className="certificate-block">
              <span>Farmer ID</span>
              <strong>{record.publicFarmerId}</strong>
            </div>
            <div className="certificate-block">
              <span>Plot</span>
              <strong>Plot {record.plotId}</strong>
            </div>
            <div className="certificate-block">
              <span>Location</span>
              <strong>{record.plotLocation}</strong>
            </div>
            <div className="certificate-block">
              <span>Issued On</span>
              <strong>{record.certificateIssuedOn || "-"}</strong>
            </div>
            <div className="certificate-block">
              <span>Valid Until</span>
              <strong>{record.certificateValidUntil || "-"}</strong>
            </div>
          </div>

          <div className="certificate-metrics">
            <div className="calc-box">
              <div className="label">Final Credits</div>
              <div className="value">{formatNumber(record.finalCredits, 4)}</div>
            </div>
            <div className="calc-box">
              <div className="label">CO2_eq (kg)</div>
              <div className="value">{formatNumber(record.co2Eq, 2)}</div>
            </div>
            <div className="calc-box">
              <div className="label">Confidence</div>
              <div className="value">{formatNumber(record.confidence * 100, 2)}%</div>
            </div>
            <div className="calc-box">
              <div className="label">Estimated Revenue</div>
              <div className="value">Rs {formatNumber(record.revenue, 2)}</div>
            </div>
          </div>

          <div className="certificate-note">
            <strong>Approval Note</strong>
            <p>{record.approvalNotes || "No approval note available for this certificate yet."}</p>
          </div>

          <div className="certificate-footer">
            <span>Verifier: {record.verifierName}</span>
            <button className="secondary" onClick={onClose}>Close Preview</button>
          </div>
        </div>
      </div>
    </div>
  );
}
