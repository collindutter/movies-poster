export default function Films() {
  return <>HELLO</>;
}

export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}
