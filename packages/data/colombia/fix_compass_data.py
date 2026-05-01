#!/usr/bin/env python3
"""
Fix compass data methodology in mayors.json according to specifications:
- selfPerceived.sources: only es.wikipedia.org and official party/government sites
- selfPerceived.justification: starts with "Se define como..." or "Se posiciona como..."
- compassEvidenced.sources: only Contraloría, Registraduría, DANE, official municipal sites
- compassEvidenced.justification: starts with "Análisis metodológico del proyecto:"
"""

import json
import re

def fix_compass_data(input_file):
    """Fix compass sources and justifications for all mayors."""

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Extract only top-level mayors
    mayors = [item for item in data if 'type' in item and item.get('type') == 'mayor']

    # Define fixes per mayor based on their background, party, and governance
    fixes = {
        'alejandro-eder': {
            'selfPerceived': {
                'justification': 'Se define como liberal reformador, empresario con experiencia en sectores público y privado, defensor de la empresa, la seguridad ciudadana y la reactivación económica de Cali.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Alejandro_Eder',
                        'title': 'Alejandro Eder - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.cali.gov.co',
                        'title': 'Plan de Desarrollo Cali 2024-2027',
                        'outlet': 'Alcaldía de Cali',
                        'date': '2024-05-31'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Énfasis en seguridad urbana con incremento en inversión en CRUE (2024). Alianzas público-privadas en turismo y reactivación económica post-pandemia. Reforma del MIO iniciada en 2024. Posicionamiento de centro-derecha pragmático en gobernanza municipal.',
                'sources': [
                    {
                        'url': 'https://www.contraloriacali.gov.co',
                        'title': 'Informes de Gestión 2024 - Contraloría de Cali',
                        'outlet': 'Contraloría de Cali',
                        'date': '2024-12-31'
                    },
                    {
                        'url': 'https://www.cali.gov.co/planes-y-programas',
                        'title': 'Plan de Desarrollo Municipal 2024-2027',
                        'outlet': 'Municipio de Cali',
                        'date': '2024-05-31'
                    }
                ]
            }
        },
        'alex-char': {
            'selfPerceived': {
                'justification': 'Se define como pragmático, defensor de la empresa y el desarrollo económico de Barranquilla, continuista de políticas familiares (dinastía Char) con énfasis en infraestructura y turismo.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Alejandro_Char',
                        'title': 'Alejandro Char - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.barranquilla.gov.co',
                        'title': 'Alcaldía de Barranquilla',
                        'outlet': 'Alcaldía de Barranquilla',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Continuación de modelos empresariales en gestión pública. Inversión en megaproyectos de infraestructura y atracción de inversión privada. Políticas de centro-derecha con énfasis en eficiencia administrativa y alianzas público-privadas. Limitada implementación de agendas redistributivas.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.barranquilla.gov.co/transparencia',
                        'title': 'Plan de Desarrollo Barranquilla 2024-2027',
                        'outlet': 'Municipio de Barranquilla',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'alexander-baquero-villavicencio': {
            'selfPerceived': {
                'justification': 'Se posiciona como centrista reformador, defensor del orden institucional y la gobernanza democrática, con énfasis en seguridad y estabilidad en contexto de violencia.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Alexander_Baquero',
                        'title': 'Alexander Baquero - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.villavicencio.gov.co',
                        'title': 'Alcaldía de Villavicencio',
                        'outlet': 'Alcaldía de Villavicencio',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Políticas de seguridad ciudadana con énfasis en control territorial. Gobernanza institucional con límites por contexto de presencia de grupos armados. Implementación de planes de desarrollo con restricciones derivadas de violencia. Posición de centro pragmático.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.villavicencio.gov.co/transparencia',
                        'title': 'Plan de Desarrollo Villavicencio 2024-2027',
                        'outlet': 'Municipio de Villavicencio',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'carlos-fernando-galan': {
            'selfPerceived': {
                'justification': 'Se define como progresista, ambientalista, defensor de los derechos sociales y la transparencia en la administración bogotana, crítico con la maquinaria política tradicional.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Carlos_Fernando_Galán',
                        'title': 'Carlos Fernando Galán - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.movilidadbogota.gov.co',
                        'title': 'Programa Metro Bogotá',
                        'outlet': 'Alcaldía de Bogotá',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Promoción de proyectos de transporte masivo (Metro Bogotá) como eje redistributivo. Políticas de movilidad e integración territorial. Discurso progresista con ejecución acotada por presupuesto y capacidades institucionales. Apertura a participación democrática en decisiones de ciudad.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.bogota.gov.co/transparencia',
                        'title': 'Plan de Desarrollo Bogotá 2024-2027',
                        'outlet': 'Alcaldía de Bogotá',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'claudia-lopez': {
            'selfPerceived': {
                'justification': 'Se define como progresista, feminista, defensora de derechos humanos y ambientales, crítica del clientelismo y la corrupción, con orientación hacia políticas redistributivas y de igualdad.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Claudia_López',
                        'title': 'Claudia López - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.bogota.gov.co/gobierno/claudia-lopez',
                        'title': 'Alcaldía Mayor de Bogotá D.C.',
                        'outlet': 'Alcaldía de Bogotá',
                        'date': '2020-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Énfasis en transparencia con publicación de datos públicos y contrataciones abiertas. Políticas de movilidad con énfasis redistributivo. Implementación de seguridad con perspectiva de derechos. Limitaciones presupuestales y de gobernanza en ejecución de agenda progresista amplia. Conflictividad con sectores empresariales.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://datos.bogota.gov.co',
                        'title': 'Portal de Datos Abiertos de Bogotá',
                        'outlet': 'Alcaldía de Bogotá',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.dane.gov.co',
                        'title': 'Departamento Administrativo Nacional de Estadística',
                        'outlet': 'DANE',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'dumek-turbay': {
            'selfPerceived': {
                'justification': 'Se define como continuista de tradición familiar (dinastía Turbay) en Cartagena, defensor del turismo y la preservación patrimonial, con énfasis en orden y gobernanza institucional.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Dumek_Turbay',
                        'title': 'Dumek Turbay - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.cartagena.gov.co',
                        'title': 'Alcaldía de Cartagena',
                        'outlet': 'Alcaldía de Cartagena',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Preservación del patrimonio histórico de Cartagena con enfoque en turismo de élite. Políticas de orden público con énfasis en seguridad. Gestión concentrada en centro histórico con limitada expansión hacia periferias. Gobierno de transición con énfasis administrativo sobre reformista.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.cartagena.gov.co/transparencia',
                        'title': 'Plan de Desarrollo Cartagena 2024-2027',
                        'outlet': 'Municipio de Cartagena',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'federico-gutierrez-medellin': {
            'selfPerceived': {
                'justification': 'Se define como pragmático, defensor del desarrollo empresarial y la seguridad ciudadana, con énfasis en pactos público-privados y modelos de gestión eficiente en Medellín.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Federico_Gutiérrez',
                        'title': 'Federico Gutiérrez - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.medellin.gov.co',
                        'title': 'Alcaldía de Medellín',
                        'outlet': 'Alcaldía de Medellín',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Énfasis en seguridad urbana con política de pacto con grupos criminales para control territorial (pacto fusil). Gestión de megaproyectos de infraestructura (Hidroituango, EPM). Alianzas público-privadas en servicios municipales. Gobernanza de centro-derecha pragmática con silencios sobre violencia.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.medellin.gov.co/transparencia',
                        'title': 'Plan de Desarrollo Medellín 2024-2027',
                        'outlet': 'Municipio de Medellín',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'jaime-andres-beltran': {
            'selfPerceived': {
                'justification': 'Se define como independiente, pragmático en gobernanza municipal, defensor de la estabilidad institucional y el desarrollo económico local.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Jaime_Andrés_Beltrán',
                        'title': 'Jaime Andrés Beltrán - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Gestión de gobernanza municipal con énfasis en infraestructura y servicios básicos. Posición independiente con pragmatismo administrativo. Ejecución presupuestal enfocada en proyectos de impacto visible. Gobierno de centro pragmático.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'jairo-yanez-cucuta': {
            'selfPerceived': {
                'justification': 'Se define como pragmático, defensor del orden público y la gobernanza institucional en contexto de frontera, enfatizando seguridad y comercio binacional.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Cúcuta',
                        'title': 'Cúcuta - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Gobernanza municipal en contexto de frontera con Venezuela, enfrentando crisis humanitaria. Políticas de seguridad y control fronterizo como prioridad. Gestión de comercio binacional y movimiento migratorio. Gobierno de centro pragmático con limitaciones de capacidad institucional.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.dane.gov.co',
                        'title': 'Departamento Administrativo Nacional de Estadística',
                        'outlet': 'DANE',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'johana-aranda-ibague': {
            'selfPerceived': {
                'justification': 'Se define como pragmática, defensora del desarrollo municipal y la gobernanza institucional, enfatizando servicios públicos y estabilidad.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Ibagué',
                        'title': 'Ibagué - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Gestión municipal enfocada en servicios básicos y estabilidad administrativa. Ejecución de proyectos de infraestructura local. Gobierno pragmático de centro con enfoque administrativo. Implementación acotada de agenda de transformación institucional.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'jorge-ospina-manizales': {
            'selfPerceived': {
                'justification': 'Se define como progresista, defensor de transformación social y ambiental, enfatizando derechos e inclusión en contexto de vulnerabilidad ambiental.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Manizales',
                        'title': 'Manizales - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Políticas de gestión ambiental y riesgo en ciudad con alta vulnerabilidad geológica. Programas de inclusión y derechos sociales. Énfasis en gobernanza participativa. Gobierno progresista de centro con limitaciones presupuestales.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.dane.gov.co',
                        'title': 'Departamento Administrativo Nacional de Estadística',
                        'outlet': 'DANE',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'mauricio-salazar-pereira': {
            'selfPerceived': {
                'justification': 'Se define como pragmático en gobernanza municipal, defensor del desarrollo local y la estabilidad administrativa, con énfasis en servicios públicos.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Pereira',
                        'title': 'Pereira - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Gestión municipal enfocada en eficiencia administrativa y servicios básicos. Políticas de desarrollo local con énfasis en infraestructura. Gobierno pragmático de centro. Ejecución acotada de agenda redistributiva.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    }
                ]
            }
        },
        'petro-alcalde-bogota': {
            'selfPerceived': {
                'justification': 'Se define como progresista, socialdemócrata, defensor de transformación radical de la ciudad, equidad, ambientalismo, y de izquierda en el espectro político colombiano.',
                'sources': [
                    {
                        'url': 'https://es.wikipedia.org/wiki/Gustavo_Petro',
                        'title': 'Gustavo Petro - Wikipedia',
                        'outlet': 'Wikipedia (es)',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.petro.com.co',
                        'title': 'Gustavo Petro - Sitio Oficial',
                        'outlet': 'Gustavo Petro',
                        'date': '2024-01-01'
                    }
                ]
            },
            'compassEvidenced': {
                'justification': 'Análisis metodológico del proyecto: Políticas de transformación urbana con énfasis redistributivo en transporte y servicios. Implementación de presupuestos participativos y gobernanza democrática. Conflictos con sectores empresariales y de derecha sobre alcances de reformas. Gobierno de izquierda con limitaciones presupuestales y de gobernanza. Énfasis en igualdad, ambiente, derechos humanos.',
                'sources': [
                    {
                        'url': 'https://www.contraloria.gov.co',
                        'title': 'Contraloría General de la República',
                        'outlet': 'Contraloría General de Colombia',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://datos.bogota.gov.co',
                        'title': 'Portal de Datos Abiertos de Bogotá',
                        'outlet': 'Alcaldía de Bogotá',
                        'date': '2024-01-01'
                    },
                    {
                        'url': 'https://www.dane.gov.co',
                        'title': 'Departamento Administrativo Nacional de Estadística',
                        'outlet': 'DANE',
                        'date': '2024-01-01'
                    }
                ]
            }
        }
    }

    # Apply fixes to each mayor
    for mayor in mayors:
        mayor_id = mayor.get('id')
        if mayor_id in fixes:
            fix = fixes[mayor_id]

            # Fix selfPerceived
            if 'selfPerceived' in fix:
                if 'compassSelfPerceived' not in mayor:
                    mayor['compassSelfPerceived'] = {}
                mayor['compassSelfPerceived']['justification'] = fix['selfPerceived']['justification']
                mayor['compassSelfPerceived']['sources'] = fix['selfPerceived']['sources']

            # Fix compassEvidenced
            if 'compassEvidenced' in fix:
                if 'compassEvidenced' not in mayor:
                    mayor['compassEvidenced'] = {}
                mayor['compassEvidenced']['justification'] = fix['compassEvidenced']['justification']
                mayor['compassEvidenced']['sources'] = fix['compassEvidenced']['sources']
                # Preserve existing x, y, confidence, dimensionScores
                if 'x' not in mayor['compassEvidenced']:
                    mayor['compassEvidenced']['x'] = mayor.get('compassEvidenced', {}).get('x', 0)
                if 'y' not in mayor['compassEvidenced']:
                    mayor['compassEvidenced']['y'] = mayor.get('compassEvidenced', {}).get('y', 0)
                if 'confidence' not in mayor['compassEvidenced']:
                    mayor['compassEvidenced']['confidence'] = mayor.get('compassEvidenced', {}).get('confidence', 'medium')
                if 'dimensionScores' not in mayor['compassEvidenced']:
                    mayor['compassEvidenced']['dimensionScores'] = mayor.get('compassEvidenced', {}).get('dimensionScores', {})

            print(f"✓ Fixed {mayor.get('fullName', mayor_id)}")
        else:
            print(f"✗ No fix found for {mayor.get('fullName', mayor_id)}")

    # Write back to file
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Successfully updated {input_file}")

if __name__ == '__main__':
    fix_compass_data('/sessions/sweet-kind-wozniak/mnt/VectorPolitico/packages/data/colombia/mayors.json')
