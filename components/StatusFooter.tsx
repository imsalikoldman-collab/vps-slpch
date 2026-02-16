interface StatusFooterProps {
  user?: string;
}

export default function StatusFooter({ user = "██████" }: StatusFooterProps) {
  return <div className="footer">user: {user}</div>;
}
