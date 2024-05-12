import { useState } from "react";
import { AllCloudEvents } from "../../utils/cloudevents/AllCloudEvents";

export const DebugContent = () => {
  const defaultRefreshInterval = 5000;
  const [refreshInterval, setRefreshInterval] = useState(
    defaultRefreshInterval,
  );

  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setRefreshInterval(e.target.checked ? defaultRefreshInterval : 0);
  };

  return (
    <>
      <div className="form-control mb-2">
        <label className="label cursor-pointer">
          <span className="label-text">Update automatically</span>
          <input
            type="checkbox"
            className="toggle"
            checked={refreshInterval > 0}
            onChange={handleInput}
          />
        </label>
      </div>
      <AllCloudEvents
        className="my-4"
        source="http://localhost:3000/market/events"
        config={{ refreshInterval }}
      />
    </>
  );
};
