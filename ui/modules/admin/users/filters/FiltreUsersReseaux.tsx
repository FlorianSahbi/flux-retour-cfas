import { Checkbox, CheckboxGroup, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { IReseau } from "shared";

import { FilterButton } from "@/components/FilterButton/FilterButton";
import SimpleOverlayMenu from "@/modules/dashboard/SimpleOverlayMenu";

interface FiltreUsersReseauxTypesProps {
  reseaux: IReseau[];
  value: string[];
  onChange: (reseaux: string[]) => void;
}

function FiltreUsersReseaux(props: FiltreUsersReseauxTypesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reseaux = props.value;

  return (
    <div>
      <FilterButton isOpen={isOpen} setIsOpen={setIsOpen} buttonLabel="Réseaux" badge={reseaux?.length} />
      {isOpen && (
        <SimpleOverlayMenu onClose={() => setIsOpen(false)} width="auto" p="3w">
          <CheckboxGroup
            defaultValue={reseaux}
            size="sm"
            onChange={(selectedReseaux: string[]) => props.onChange(selectedReseaux)}
          >
            <Stack>
              {props.reseaux.map((reseau, i) => (
                <Checkbox iconSize="0.5rem" value={reseau.key} key={i}>
                  {reseau.nom}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </SimpleOverlayMenu>
      )}
    </div>
  );
}

export default FiltreUsersReseaux;
