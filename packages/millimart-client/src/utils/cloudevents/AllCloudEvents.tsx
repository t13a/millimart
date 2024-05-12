import { CloudEventCard } from "./CloudEventCard";
import { UseCloudEventsProps, useCloudEvents } from "./useCloudEvents";

export type AllCloudEventsProps = React.HTMLAttributes<HTMLDivElement> &
  UseCloudEventsProps;

export const AllCloudEvents = ({
  source,
  init,
  config,
  ...rest
}: AllCloudEventsProps) => {
  const { data, error } = useCloudEvents({ source, init, config });

  if (error !== undefined) return <div>Failed to load</div>;
  if (data === undefined) return <div>Loading...</div>;

  return (
    <>
      {data.toReversed().map((event) => (
        <CloudEventCard key={event.id} event={event} {...rest} />
      ))}
    </>
  );
};
