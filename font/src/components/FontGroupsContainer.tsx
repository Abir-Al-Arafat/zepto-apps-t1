import { useState } from "react";
import FontGroupList from "./FontGroupList";

const FontGroupsContainer = () => {
  const [fontGroups, setFontGroups] = useState([
    { id: 1, title: "Example 1", fonts: ["Roboto", "New Time Romans"] },
    {
      id: 2,
      title: "Example 2",
      fonts: ["Roboto", "New Time Romans", "Verdana"],
    },
    { id: 3, title: "Example 3", fonts: ["New Time Romans", "Verdana"] },
  ]);

  const handleEdit = (id: number) => {
    console.log("Edit font group:", id);
    // Open edit modal or page
  };

  const handleDelete = (id: number) => {
    setFontGroups(fontGroups.filter((group) => group.id !== id));
  };

  return (
    <FontGroupList
      fontGroups={fontGroups}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default FontGroupsContainer;
