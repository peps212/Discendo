const List = ({ordered, children}) => {

    return ordered ? (
        <ol className="list-decimal text-red-500">
          {children}
        </ol>
      ) : (
        <ul className="" style={{listStyleType: "disc"}}>
          {children}
        </ul>
      );
    };

export default List