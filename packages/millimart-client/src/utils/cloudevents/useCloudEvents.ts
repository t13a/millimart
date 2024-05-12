import { CloudEventSchema } from "millimart-kernel";
import useSWR, { SWRConfiguration } from "swr";

export type UseCloudEventsProps = {
  source: string | URL;
  init?: RequestInit;
  config?: SWRConfiguration;
};

export const useCloudEvents = ({
  source,
  init,
  config,
}: UseCloudEventsProps) => {
  const fetcher = (input: string | URL) =>
    fetch(input, init)
      .then((res) => res.json())
      .then((value) => CloudEventSchema.array().parse(value));
  return useSWR(source.toString(), fetcher, config);
};
