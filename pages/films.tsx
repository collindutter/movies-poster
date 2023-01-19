import { Group, Text, useMantineTheme } from "@mantine/core";
import { IconUpload, IconMovie, IconX } from "@tabler/icons";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import { searchMovie } from "../api/tmdb";

export default function Films(props: any) {
  const theme = useMantineTheme();
  console.log(props.searchResult);
  return (
    <Dropzone
      onDrop={(files) => console.log("accepted files", files)}
      onReject={(files) => console.log("rejected files", files)}
      maxSize={3 * 1024 ** 2}
      accept={[MIME_TYPES.csv]}
    >
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 220, pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            size={50}
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor][
                theme.colorScheme === "dark" ? 4 : 6
              ]
            }
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            size={50}
            stroke={1.5}
            color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconMovie size={50} stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag csv here or click to select files
          </Text>
          <Text size="sm" color="dimmed" inline mt={7}>
            Attach as many files as you like, each file should not exceed 5mb
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}

export async function getServerSideProps() {
  const searchResult = (await searchMovie("Goodfellas")).data;

  return {
    props: { searchResult }, // will be passed to the page component as props
  };
}
