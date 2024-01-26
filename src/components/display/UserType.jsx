export default function UserType({ type }) {
  const types = {
    s: "SuperAdmin",
    a: "Admin",
    g: "Gerente",
    f: "Funcionário",
  }
  return types[type]
}
