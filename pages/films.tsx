import { IconUpload, IconMovie, IconX } from "@tabler/icons";
import {
  Dropzone,
  DropzoneProps,
  FileWithPath,
  MIME_TYPES,
} from "@mantine/dropzone";
import { useState } from "react";
import {
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  useMantineTheme,
} from "@mantine/core";
import { parse } from "papaparse";

interface LetterboxdFilm {
  Date: string;
  "LetterBoxd URI": string;
  Name: string;
  Year: string;
}

interface Film {
  date: string;
  letterboxdUri: string;
  name: string;
  year: string;
}

/**
 * Clean dirty film from CSV parse to pristine film ready for API.
 * @param dirtyFilm dirty film parsed from CSV
 * @returns cleaned film
 */
const cleanFilm = (dirtyFilm: LetterboxdFilm): Film => {
  return Object.entries(dirtyFilm).reduce((acc, [key, value]) => {
    let cleanedKey = key.toLowerCase();

    // don't want to implement a camel case function for one string
    if (cleanedKey === "letterboxd uri") {
      cleanedKey = "letterboxdUri";
    }
    acc[cleanedKey] = value;

    return acc;
  }, {} as any) as Film;
};

export default function Films(props: any) {
  const theme = useMantineTheme();
  const [films, setFilms] = useState<Film[]>([]);

  /**
   * Parse the first CSV file uploaded to the dropzone.
   * @param files list of files uploaded to dropzone
   */
  const parseCsv = (files: FileWithPath[]) => {
    console.log(files);
    parse(files[0], {
      worker: true,
      header: true,
      error: (err: any, file: any, inputElem: any, reason: any) => {
        console.error({ err, file, inputElem, reason });
      },
      complete: (results) => {
        console.log(results);
        setFilms(results.data.map((film) => cleanFilm(film as LetterboxdFilm)));
        console.log(films);
      },
    });
  };

  return (
    <>
      <Dropzone
        onDrop={(files) => parseCsv(files)}
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
      {films.map((film, index) => (
        <Card key={index} shadow="sm" p="lg" radius="md" withBorder>
          <Card.Section>
            <Image
              src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
              height={160}
              alt="Norway"
            />
          </Card.Section>

          <Group position="apart" mt="md" mb="xs">
            <Text weight={500}>{film.name}</Text>
            <Badge color="pink" variant="light">
              On Sale
            </Badge>
          </Group>

          <Text size="sm" color="dimmed">
            With Fjord Tours you can explore more of the magical fjord
            landscapes with tours and activities on and around the fjords of
            Norway
          </Text>

          <Button
            variant="light"
            color="blue"
            fullWidth
            mt="md"
            radius="md"
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={film.letterboxdUri}
          >
            View On Letterboxd
          </Button>
        </Card>
      ))}
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}
