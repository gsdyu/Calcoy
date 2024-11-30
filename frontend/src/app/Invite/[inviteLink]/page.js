import InvitePage from '@/components/Sidebar/InvitePage';

export default function Invite({ params }) {
  const { inviteLink } = params; // Capture the dynamic inviteLink
  return <InvitePage inviteLink={inviteLink} />;
}
