import { CloudEvent } from "millimart-kernel";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokai } from "react-syntax-highlighter/dist/esm/styles/hljs";
import TimeAgo from "timeago-react";

export type CloudEventCardProps = React.HTMLAttributes<HTMLDivElement> & {
  event: CloudEvent;
};

export const CloudEventCard = ({
  event,
  className,
  ...rest
}: CloudEventCardProps) => {
  return (
    <div
      className={`card card-compact collapse-arrow collapse ${className}`}
      {...rest}
    >
      <input type="checkbox" />
      <div className="card-body bg-base-100 collapse-title">
        <div className="card-title me-6">
          <code>{event.type}</code>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <code className="badge badge-ghost">{event.id}</code>
          <span className="text-neutral-500">from</span>
          <code className="badge badge-ghost">{event.source}</code>
          {event.time ? (
            <>
              <span className="text-neutral-500">at</span>
              <span title={event.time}>
                <TimeAgo datetime={event.time} opts={{ minInterval: 60 }} />
              </span>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div
        className="collapse-content overflow-x-scroll"
        style={{ background: monokai["hljs"].background }}
      >
        <div className="pt-2">
          <SyntaxHighlighter language="json" style={monokai}>
            {JSON.stringify(event, undefined, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};
