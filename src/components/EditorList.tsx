import React from "react";
import { Virtuoso } from "react-virtuoso";

interface MessageListProps {
  children: React.ReactNode;
}

const EditorList: React.FC<MessageListProps> = ({ children }) => {
  // Convert ReactNode children to an array of elements.
  const childrenArray = React.Children.toArray(children);
  const itemContent = (index: number) => <div>{childrenArray[index]}</div>;

  return (
    <div className="flex flex-grow">
      <Virtuoso
        useWindowScroll
        data={childrenArray}
        style={{ width: "100%" }}
        totalCount={childrenArray.length}
        initialTopMostItemIndex={childrenArray.length - 1} // Set initialTopMostItemIndex to the last item
        itemContent={itemContent}
      />
    </div>
  );
};

export { EditorList };
