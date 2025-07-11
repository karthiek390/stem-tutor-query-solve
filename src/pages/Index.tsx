import StemTutor from '@/components/StemTutor';

const Index = ({ user, onLogout, refreshUser }) => {
  return <StemTutor user={user} onLogout={onLogout} refreshUser={refreshUser} />;
};

export default Index;