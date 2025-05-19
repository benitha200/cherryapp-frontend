const theme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange
  neutral: "#E6F3F3", // Very light teal
  tableHover: "#F8FAFA", // Ultra light teal for table hover
  yellow: "#D4AF37",
  green: "#D3D3D3",
};
export const SubTableHeading = () => (
  <tr>
    <td style={{ width: "10rem" }}>Kgs</td>
    <td style={{ width: "10rem" }}>Station Moisture</td>
    <td style={{ width: "10rem" }}>Lab Moisture</td>
    <td
      style={{
        width: "5rem",
        backgroundColor: theme.yellow,
      }}
    >
      +16
    </td>
    <td
      style={{
        width: "5rem",
        backgroundColor: theme.yellow,
      }}
    >
      15
    </td>
    <td
      style={{
        width: "5rem",
        backgroundColor: theme.yellow,
      }}
    >
      14
    </td>
    <td
      style={{
        width: "5rem",
        backgroundColor: theme.yellow,
      }}
    >
      13
    </td>
    <td
      style={{
        width: "5rem",
        backgroundColor: theme.yellow,
      }}
    >
      B12
    </td>
    <td
      style={{
        width: "10rem",
        backgroundColor: theme.green,
      }}
    >
      Deffect
    </td>
    <td
      style={{
        width: "10rem",
        backgroundColor: theme.green,
      }}
    >
      PP Score(%)
    </td>
    <td
      style={{
        width: "10rem",
        backgroundColor: theme.green,
      }}
    >
      Storage
    </td>
    <td
      style={{
        width: "10rem",
        backgroundColor: theme.green,
      }}
    >
      Sample Category
    </td>
    <td
      style={{
        width: "10rem",
        backgroundColor: theme.green,
      }}
    >
      Delivery Category
    </td>
  </tr>
);
