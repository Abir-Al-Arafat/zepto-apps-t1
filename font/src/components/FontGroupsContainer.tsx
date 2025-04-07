import { useEffect, useState } from "react";
import FontGroupList from "./FontGroupList";
import FontGroup from "./FontGroup";

interface FontGroupData {
  name: string;
  fonts: string[];
}

const FontGroupsContainer = () => {
  const [fontGroups, setFontGroups] = useState<FontGroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<FontGroupData | undefined>(
    undefined
  );
  const [availableFonts, setAvailableFonts] = useState([]);

  const fetchFontGroups = async () => {
    const res = await fetch("http://localhost:5001/groups");
    const data = await res.json();
    if (data.success) {
      setFontGroups(data.data);
    }
  };

  const fetchAvailableFonts = async () => {
    const res = await fetch("http://localhost:5001/fonts");
    const data = await res.json();
    if (data.success) {
      setAvailableFonts(data.data);
    }
  };

  useEffect(() => {
    fetchFontGroups();
    fetchAvailableFonts();
  }, []);

  const handleEdit = (group: FontGroupData) => {
    setSelectedGroup(group);
  };

  const handleDelete = async (name: string) => {
    await fetch(`http://localhost:5001/delete-group?name=${name}`, {
      method: "DELETE",
    });
    fetchFontGroups();
  };

  const handleGroupSaved = () => {
    setSelectedGroup(undefined); // Reset selectedGroup after save
    fetchFontGroups();
  };

  return (
    <div className="container mt-4">
      <FontGroupList
        fontGroups={fontGroups}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <FontGroup
        availableFonts={availableFonts}
        onGroupCreated={handleGroupSaved}
        initialGroup={selectedGroup} // <-- support editing
      />
    </div>
  );
};

export default FontGroupsContainer;
