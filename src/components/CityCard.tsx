import { Link } from "react-router-dom";

interface CityCardProps {
  name: string;
  image: string;
  propertyCount: number;
}

const CityCard = ({ name, image, propertyCount }: CityCardProps) => {
  return (
    <Link 
      to={`/#properties`}
      className="group relative rounded-xl overflow-hidden aspect-[4/3] block"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
      <div className="absolute bottom-4 left-4 text-background">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-sm opacity-90">
          <span className="font-semibold">{propertyCount}</span> available properties
        </p>
      </div>
    </Link>
  );
};

export default CityCard;
