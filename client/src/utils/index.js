export const formatDate = (date) => {

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};

export function dateFormatter(dateString) {
  const inputDate = new Date(dateString);

  if (isNaN(inputDate)) {
    return "Invalid Date";
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function getInitials(fullName) {
  // Return empty string for falsy or empty input
  if (!fullName || typeof fullName !== "string") return ""; 

  // Split the full name into an array of names
  const names = fullName.trim().split(" ").filter(Boolean); // Filter out empty strings

  // Check if there are names to process
  if (names.length === 0) return ""; // Handle case with no names

  // Get the first letter of the first two names and convert to uppercase
  const initials = names.slice(0, 2).map(name => name.charAt(0).toUpperCase());

  // Join the initials into a single string
  return initials.join("");
}

export const updateURL = ({ searchTerm, navigate, location }) => {
  const params = new URLSearchParams();

  if (searchTerm) {
    params.set("search", searchTerm);
  }

  const newURL = `${location?.pathname}?${params.toString()}`;
  navigate(newURL, { replace: true });

  return newURL;
};

export const PRIOTITYSTYELS = {
  high: "text-red-600",
  medium: "text-yellow-600",
  low: "text-blue-600",
};

export const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
  "overdue": "bg-red-600",
};



export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];
