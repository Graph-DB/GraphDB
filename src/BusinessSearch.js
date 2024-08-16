function BusinessSearch(props) {
  const {
    selectedCategory,
    categorySetSelector,
    refetchFunction
  } = props;
  //alert("in BusinessSearch");

   return (
    <div>
      <h1>Business Search</h1>
      <form>
        <label>
          Select Business Category:
          <select
            name="categorySelect"
            value={selectedCategory}
            onChange={(event) => categorySetSelector(event.target.value)}
          >
            <option value="">All</option>
            <option value="Library">Library</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Car Wash">Car Wash</option>
          </select>
        </label>
        <br />
        <input type="button" value="Refetch" onClick={() => refetchFunction()} />
      </form>
    </div>
  );
}
export default BusinessSearch;
