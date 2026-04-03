import { Button, Share } from 'react-native';

export default function ShareButton({ sessionId }: any) {

  const handleShare = async () => {
    const link = `http://10.252.189.103:3000/track/${sessionId}`;

    await Share.share({
      message: `Track my live location: ${link}`,
    });
  };

  return <Button title="Share Location" onPress={handleShare} />;
}