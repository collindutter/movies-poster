import {
  AspectRatio,
  Card,
  Group,
  Image,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { IconMovie, IconUpload, IconX } from "@tabler/icons";
import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

import { postPoster } from "@/api/poster";
import { LetterboxdMovie, Movie, TmdbMovie } from "@/api/types";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { parse } from "papaparse";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const MAX_COLS = 10;
const ROW_HEIGHT = 75;
const FILM_WIDTH = 1;
const FILM_HEIGHT = 3;
const MIN_FILM_WIDTH = 1;
const MAX_FILM_WIDTH = 2;
const MIN_FILM_HEIGHT = 3;
const MAX_FILM_HEIGHT = 6;

const ResponsiveGridLayout = WidthProvider(Responsive);
const queryClient = new QueryClient();

/**
 * Clean dirty film from CSV parse to pristine film ready for API.
 *
 * @param {LetterboxdMovie} dirtyFilm dirty film parsed from CSV
 * @returns {Movie} cleaned film
 */
const cleanFilm = (dirtyFilm: LetterboxdMovie): Movie => {
  return Object.entries(dirtyFilm).reduce((acc, [key, value]) => {
    let cleanedKey = key.toLowerCase();

    // don't want to implement a camel case function for one string
    if (cleanedKey === "letterboxd uri") {
      cleanedKey = "letterboxdUri";
    }
    acc[cleanedKey] = value;

    return acc;
  }, {} as any) as Movie;
};

/**
 * Component for listing films
 *
 * @returns {React.ReactElement} react component
 */
export default function Films() {
  const theme = useMantineTheme();
  const [films, setFilms] = useState<TmdbMovie[]>([]);

  const mutation = useMutation({
    mutationFn: postPoster,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  /**
   * Parse the first CSV file uploaded to the dropzone.
   *
   * @param {FileWithPath[]} files  list of files uploaded to dropzone
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
        const cleanedFilms = results.data.map((film) =>
          cleanFilm(film as LetterboxdMovie)
        );
        mutation.mutate(cleanedFilms);
        setFilms(mutation.data);
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
      <ResponsiveGridLayout
        className="layout"
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{
          lg: MAX_COLS,
          md: MAX_COLS,
          sm: MAX_COLS,
          xs: MAX_COLS,
          xxs: MAX_COLS,
        }}
        rowHeight={ROW_HEIGHT}
      >
        {films.map((film, index) => (
          <Card
            key={index}
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            data-grid={{
              i: index,
              x: (index % MAX_COLS) * FILM_WIDTH,
              y: Math.floor(index / MAX_COLS),
              w: FILM_WIDTH,
              h: FILM_HEIGHT,
              minW: MIN_FILM_WIDTH,
              maxW: MAX_FILM_WIDTH,
              minH: MIN_FILM_HEIGHT,
              maxH: MAX_FILM_HEIGHT,
            }}
          >
            <Card.Section>
              <AspectRatio ratio={2 / 3} sx={{ maxWidth: 352 }} mx="auto">
                <Image
                  src={`https://image.tmdb.org/t/p/original/${film.poster_path}`}
                  alt="Panda"
                />
              </AspectRatio>
            </Card.Section>
          </Card>
        ))}
      </ResponsiveGridLayout>
    </>
  );
}
