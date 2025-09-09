import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import Message from "./Message";
import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import ChatListAdmin from "./ChatListAdmin"; // Assuming you have this component
import ChatBox from "./ChatBoxAdmin";
import ComposeChatAdmin from "./ComposeChatAdmin";
import ComposeChatAdminList from "./ComposeChatAdminList"
import ComposeChatBoxAdmin from "./ComposeChatBoxAdmin";

export const MsgRoutes = [
  {
    name: "message",
    path: ROUTE_CONSTANT.message,
    element: <Message />,
    children: [
      {
        name: "compose",
        path: ROUTE_CONSTANT.messageRoute.compose,
        // Wrapping it into a component to use hooks
        element: <ComposeChatAdmin />
      },
      {
        name: "composeMesasage",
        path: ROUTE_CONSTANT.messageRoute.composeMessage,
        // Wrapping it into a component to use hooks
        element: <ComposeWrapper />
      },
      {
        name: "inbox",
        path: ROUTE_CONSTANT.messageRoute.inbox,
        // Wrapping it into a component to use hooks
        element: <InboxWrapper />
      },
      {
        name: "msg",
        path: ROUTE_CONSTANT.message,
        element: <InboxWrapper />
      },
      {
        name: "fromEtst",
        path: ROUTE_CONSTANT.messageRoute.fromEtsy,
        element: <InboxWrapper />
      },
      {
        name: "sent",
        path: ROUTE_CONSTANT.messageRoute.sent,
        element: <InboxWrapper />
      },
      {
        name: "unread",
        path: ROUTE_CONSTANT.messageRoute.unread,
        element: <InboxWrapper />
      },
      {
        name: "pin",
        path: ROUTE_CONSTANT.messageRoute.pin,
        element: <InboxWrapper />
      },
      {
        name: "trash",
        path: ROUTE_CONSTANT.messageRoute.trash,
        element: <InboxWrapper />
      }
    ]
  }
];

// Create a wrapper component to handle the slug logic
function InboxWrapper() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const role = searchParams.get("role");

  return (
    <Box>
      {!slug ? (
        <div>
          <ChatListAdmin />
        </div>
      ) : (
        <div>
          <ChatBox slug={slug} role={role} />
        </div>
      )}
    </Box>
  );
}
// Create a wrapper component to handle the slug logic
function ComposeWrapper() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const role = searchParams.get("role");

  return (
    <Box>
       {!slug ? (
        <div>
          <ComposeChatAdminList />
        </div>
      ) : (
        <div>
          <ComposeChatBoxAdmin slug={slug} role={role}/>
        </div>
      )}
    </Box>
  );
}
