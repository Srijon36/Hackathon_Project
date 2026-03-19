const BillSummary = ({ data }) => (
  <div className="dash-card">
    <h3>🧾 Bill Summary</h3>
    <div className="dash-row">
      <span>Consumer Number</span>
      <strong>{data?.consumerNumber || "N/A"}</strong>
    </div>
    <div className="dash-row">
      <span>Units Consumed</span>
      <strong>{data?.unitsBilled || 0} kWh</strong>
    </div>
    <div className="dash-row">
      <span>Rate per Unit</span>
      <strong>₹{data?.unitsBilled > 0
        ? ((data?.energyCharges || 0) / data.unitsBilled).toFixed(2)
        : "0.00"}
      </strong>
    </div>
    <div className="dash-row">
      <span>Previous Reading</span>
      <strong>{data?.previousReadingDate
        ? new Date(data.previousReadingDate).toLocaleDateString("en-IN")
        : "N/A"}
      </strong>
    </div>
    <div className="dash-row">
      <span>Current Reading</span>
      <strong>{data?.currentReadingDate
        ? new Date(data.currentReadingDate).toLocaleDateString("en-IN")
        : "N/A"}
      </strong>
    </div>
    <div className="dash-row">
      <span>Energy Charges</span>
      <strong>₹{(data?.energyCharges || 0).toLocaleString("en-IN")}</strong>
    </div>
    <div className="dash-row">
      <span>Gross Amount</span>
      <strong>₹{(data?.grossAmount || 0).toLocaleString("en-IN")}</strong>
    </div>
    <div className="dash-row">
      <span>Rebate</span>
      <strong className="green">- ₹{(data?.rebate || 0).toLocaleString("en-IN")}</strong>
    </div>
    <div className="dash-row">
      <span>Net Amount</span>
      <strong className="blue">₹{(data?.netAmount || 0).toLocaleString("en-IN")}</strong>
    </div>
    <div className="dash-row">
      <span>Payment Status</span>
      <strong style={{
        color: data?.paymentStatus === "Paid" ? "green" :
               data?.paymentStatus === "Overdue" ? "red" : "orange"
      }}>
        {data?.paymentStatus || "Pending"}
      </strong>
    </div>
  </div>
);

export default BillSummary;