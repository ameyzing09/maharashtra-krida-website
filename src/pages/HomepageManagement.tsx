import HomepageForm from "../component/HomepageForm";
import HomepageList from "../component/HomepageList";

const HomepageManagement = () => {
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sports Management</h1>
      </div>
      <p className="text-lg mb-6">
        Welcome to the event management page. Here you can add new events and
        view existing events.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Add Content</h2>
          <HomepageForm />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">View Content</h2>
          <HomepageList />
        </div>
      </div>
    </div>
  );
};

export default HomepageManagement;
