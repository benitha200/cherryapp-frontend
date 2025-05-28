import { Form } from "react-bootstrap";

export const SubBatchTable = ({
  subelement,
  index,
  isChecked,
  batchNo,
  handleInputChange,
  sampleStorages = [],
}) => {
  return (
    <>
      <tr>
        <td>
          <div style={{ width: "9rem", marginLeft: "0.7rem" }}>
            {`${batchNo}(${subelement?.gradeKey})`}
          </div>
        </td>
        {/* total kgs */}
        <td className="align-middle">
          {Object.values(subelement?.transfer?.outputKgs ?? {}).reduce(
            (acc, number) => (typeof number == "number" ? acc + number : acc),
            0
          )}
        </td>
        {/* station moisture */}
        <td className="align-middle">{subelement?.cwsMoisture ?? "N/A"}</td>
        {/* lab moisture */}
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.labMoisture}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "labMoisture",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>
        {/* +16 */}
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.screen["16+"]}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "16",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.screen["15"]}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "15",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.screen["14"]}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "14",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.screen["13"]}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "13",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.screen["B/12"]}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "B/12",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>

        {/* deffect */}
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.defect}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "deffect",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>
        {/* pp score */}
        <td className="align-middle">
          <input
            type="number"
            className="form-control"
            style={{ width: "7rem" }}
            defaultValue={subelement?.ppScore}
            disabled={!isChecked(batchNo)}
            onChange={(e) =>
              handleInputChange(
                batchNo,
                "ppScore",
                index % 2 == 0 ? "A0" : "A1",
                e.target.value
              )
            }
          />
        </td>

        {/* storage */}
        <td className="align-middle">
          {/* <div style={{ width: "7rem" }}>
            {subelement?.sampleStorage?.name ?? "N/A"}
          </div> */}
          <div>
            <Form.Select
              style={{ width: "7rem" }}
              disabled={!isChecked(batchNo)}
              onChange={(e) =>
                handleInputChange(
                  batchNo,
                  "storage",
                  index % 2 == 0 ? "A0" : "A1",
                  e.target.value
                )
              }
              defaultValue={subelement?.sampleStorage?.id ?? "N/A"}
            >
              {sampleStorages?.map((type) => (
                <option key={type?.name} value={type?.id}>
                  {type?.name}
                </option>
              ))}
            </Form.Select>
          </div>
        </td>

        <td className="align-middle">{subelement?.category}</td>
        <td className="align-middle">{subelement?.newCategory ?? "-"}</td>
      </tr>
    </>
  );
};
