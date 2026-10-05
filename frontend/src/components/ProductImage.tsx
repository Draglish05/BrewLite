import CupIcon from '@/components/CupIcon';

// Ảnh của 1 món: lấy theo imageUrl từ backend
// Món nào chưa có ảnh thì vẽ hình ly bằng màu của món
type ProductImageProps = {
  imageUrl: string;
  color: string;
  name: string;
  className: string; // class Tailwind, ví dụ 'h-20'
};

export default function ProductImage({ imageUrl, color, name, className }: ProductImageProps) {
  if (imageUrl === '') {
    return <CupIcon color={color} className={className} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imageUrl} alt={name} className={className} />;
}
