<tbody>
  {!data || data.length === 0 ? (
    <tr>
      <td colSpan={`${columns?.length ?? 4}`}>
        <div className="text-center fw-bold fs-5 p-3 border border-warning rounded bg-light text-dark">
          {emptyStateMessage}
        </div>
      </td>
    </tr>
  ) : (
    data.map((item, rowIndex) => (
      <>
        {/* first row */}
        <tr key={rowIndex}>
          {/* batch no */}
          <td
            style={{
              padding: "10px 15px",
              borderBottom: `1px solid ${processingTheme.tableBorder}`,
            }}
          >
            {`${item?.batchNo} ${item?.sample?.batches[0]?.gradeKey ?? ""}`}
          </td>
          {/* parchment qt */}
          <td
            style={{
              padding: "10px 15px",
              borderBottom: `1px solid ${processingTheme.tableBorder}`,
            }}
          >
            {`${
              item?.sample?.outputKgs[item?.sample?.batches[0]?.gradeKey ?? ""]
            }`}
          </td>
          {/* date of analysis */}
          <td>{formatDate(item?.delivery?.batches[0]?.createdAt)}</td>
          {/* moisture content lag(%) sample */}
          <td>{item?.sample?.batches[0]?.labMoisture}</td>
          {/* moisture content lag(%) delivery */}
          <td>{item?.sample?.batches[0]?.cwsMoisture}</td>
          {/* variation M.c */}
          <td style={styleValiations()}>
            {(item?.sample?.batches[0]?.labMoisture ?? 0) -
              (item?.sample?.batches[0]?.cwsMoisture ?? 0)}
          </td>
          {/* 16+ */}
          <td>{item?.delivery?.batches[0]?.screen["16+"] ?? 0}</td>
          {/* + 15 */}
          <td>{item?.delivery?.batches[0]?.screen["15"] ?? 0}</td>
          {/* av 15+ Delivary */}
          <td>
            {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
              Number(item?.delivery?.batches[0]?.screen["15"] ?? 0)}
          </td>
          {/* av .15+ samples */}
          <td>
            {Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
              Number(item?.sample?.batches[0]?.screen["15"] ?? 0)}
          </td>
          {/* variation 15+ */}
          <td style={styleValiations()}>
            {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
              Number(item?.delivery?.batches[0]?.screen["15"] ?? 0) -
              (Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
                Number(item?.sample?.batches[0]?.screen["15"] ?? 0))}
          </td>
          {/* 14 */}
          <td>{item?.delivery?.batches[0]?.screen["14"] ?? 0}</td>
          {/* 13 */}
          <td>{item?.delivery?.batches[0]?.screen["13"] ?? 0}</td>
          {/* av 13/14/delivery */}
          <td>
            {Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
              Number(item?.delivery?.batches[0]?.screen["13"] ?? 0)}
          </td>
          {/* av 13/14/sample */}
          <td>
            {Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
              Number(item?.sample?.batches[0]?.screen["13"] ?? 0)}
          </td>
          {/* variation 15+ */}
          <td style={styleValiations()}>
            {Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
              Number(item?.delivery?.batches[0]?.screen["13"] ?? 0) -
              (Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
                Number(item?.sample?.batches[0]?.screen["13"] ?? 0))}
          </td>
          <td>{item?.delivery?.batches[0]?.screen["B/12"] ?? 0}</td>
          {/* deffect  */}
          <td>{item?.delivery?.batches[0]?.defect ?? 0}</td>
          {/* av.lg delivery */}
          <td>
            {Number(item?.delivery?.batches[0]?.screen["B/12"] ?? 0) +
              Number(item?.delivery?.batches[0]?.defect ?? 0)}
          </td>
          {/* av.lg samples */}
          <td>
            {Number(item?.sample?.batches[0]?.screen["B/12"] ?? 0) +
              Number(item?.sample?.batches[0]?.defect ?? 0)}
          </td>
          {/* variation lg */}
          <td style={styleValiations()}>
            {Number(item?.delivery?.batches[0]?.screen["B/12"] ?? 0) +
              Number(item?.delivery?.batches[0]?.defect ?? 0) -
              (Number(item?.sample?.batches[0]?.screen["B/12"] ?? 0) +
                Number(item?.sample?.batches[0]?.defect ?? 0))}
          </td>
          {/* ot Delivery */}
          <td>
            {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
              Number(item?.delivery?.batches[0]?.screen["15"] ?? 0) +
              (Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
                Number(item?.delivery?.batches[0]?.screen["13"] ?? 0)) +
              (Number(item?.delivery?.batches[0]?.screen["B/12"] ?? 0) +
                Number(item?.delivery?.batches[0]?.defect ?? 0))}
          </td>
          {/* ot Sample */}
          <td>
            {Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
              Number(item?.sample?.batches[0]?.screen["15"] ?? 0) +
              (Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
                Number(item?.sample?.batches[0]?.screen["13"] ?? 0)) +
              (Number(item?.sample?.batches[0]?.screen["B/12"] ?? 0) +
                Number(item?.sample?.batches[0]?.defect ?? 0))}
          </td>
          {/* variation ot */}
          <td style={styleValiations()}>
            {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
              Number(item?.delivery?.batches[0]?.screen["15"] ?? 0) +
              (Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
                Number(item?.delivery?.batches[0]?.screen["13"] ?? 0)) +
              (Number(item?.delivery?.batches[0]?.screen["B/12"] ?? 0) +
                Number(item?.delivery?.batches[0]?.defect ?? 0)) -
              (Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
                Number(item?.sample?.batches[0]?.screen["15"] ?? 0) +
                (Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
                  Number(item?.sample?.batches[0]?.screen["13"] ?? 0)) +
                (Number(item?.sample?.batches[0]?.screen["B/12"] ?? 0) +
                  Number(item?.sample?.batches[0]?.defect ?? 0)))}
          </td>

          {/* pp Score Delivery */}
          <td>{item?.delivery?.batches[0]?.ppScore ?? 0}</td>
          {/* pp score sample  */}
          <td>{item?.sample?.batches[0]?.ppScore ?? 0}</td>
          {/* category */}
          <td>{item?.sample?.batches[0]?.newCategory ?? "-"}</td>
          {/* pp score variation  */}
          <td style={styleValiations()}>
            {Number(item?.delivery?.batches[0]?.ppScore ?? 0) -
              Number(item?.sample?.batches[0]?.ppScore ?? 0)}
          </td>
          {/* Sample storage  */}
          <td>{item?.sample?.batches[0]?.sampleStorage?.name ?? "-"}</td>
        </tr>
      </>
    ))
  )}
</tbody>;
