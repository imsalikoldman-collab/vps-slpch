export interface PersonnelEntry {
  id: string;
  fullName: string;
  role: string;
  status: string;
}

export const personnelEntries: PersonnelEntry[] = [
  {
    id: "SCU-███",
    fullName: "Чхве Сынчоль",
    role: "Старший инспектор",
    status: "Активен",
  },
  {
    id: "SCU-███",
    fullName: "Ли Джихун",
    role: "Оперативный сотрудник",
    status: "Активен",
  },
  {
    id: "SCU-███",
    fullName: "[ДАННЫЕ УДАЛЕНЫ]",
    role: "Консультант",
    status: "Статус засекречен",
  },
  {
    id: "SCU-███",
    fullName: "Ким Мингю",
    role: "Оперативный сотрудник",
    status: "Активен",
  },
];
