export function Formatmessagetime(time){
return new Date(time).toLocaleTimeString("en-us", {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}